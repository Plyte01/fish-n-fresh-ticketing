// src/lib/pdf.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Ticket, Event } from '@prisma/client';

type TicketWithEvent = Ticket & { event: Event };

export async function generateTicketPdf({
  ticket,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  qrCodeDataURL: _, // Parameter kept for API compatibility, but not used in current implementation
}: {
  ticket: TicketWithEvent;
  qrCodeDataURL: string;
}): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any = null;

  try {
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const url = `${baseUrl}/api/tickets/render/${ticket.ticketCode}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ticket HTML fetch failed:", errorText);
      throw new Error(`Failed to fetch rendered ticket HTML. Status: ${response.status}, Error: ${errorText}`);
    }

    const html = await response.text();
    const isProduction = process.env.NODE_ENV === 'production';
    const isCloudDeployment = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.RAILWAY_ENVIRONMENT;

    // Use different puppeteer instances based on environment
    if (isProduction && isCloudDeployment) {
      // Cloud deployment: use puppeteer-core with @sparticuz/chromium
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local development or local production build: use regular puppeteer or system Chrome
      let browserLaunched = false;
      
      // First try to use puppeteer with bundled Chrome
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const puppeteerDev = require('puppeteer');
        browser = await puppeteerDev.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: true,
        });
        browserLaunched = true;
      } catch (error) {
        console.log('Puppeteer with bundled Chrome failed, trying system Chrome:', error);
      }

      // If puppeteer failed, try common Chrome executable paths as fallback
      if (!browserLaunched) {
        const chromePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
        ];
        
        for (const chromePath of chromePaths) {
          try {
            browser = await puppeteer.launch({
              args: ['--no-sandbox', '--disable-setuid-sandbox'],
              headless: true,
              executablePath: chromePath,
            });
            browserLaunched = true;
            break;
          } catch {
            // Continue to next path
          }
        }
      }
      
      if (!browserLaunched) {
        throw new Error('No suitable Chrome installation found. Please install Google Chrome or run: npx puppeteer browsers install chrome');
      }
    }

    if (!browser) {
      throw new Error('Failed to launch browser');
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`Could not generate ticket PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}
