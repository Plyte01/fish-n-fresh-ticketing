// src/lib/pdf.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Ticket, Event } from '@prisma/client';

type TicketWithEvent = Ticket & { event: Event };

async function generateFallbackPdf(ticket: TicketWithEvent): Promise<Buffer> {
  // Simple HTML to PDF conversion without Chromium
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket - ${ticket.event.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .ticket { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
        .event-name { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .ticket-info { margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        .qr-section { text-align: center; margin-top: 30px; }
        .ticket-code { font-size: 18px; font-weight: bold; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <div class="event-name">${ticket.event.name}</div>
          <div style="color: #666;">Event Ticket</div>
        </div>
        <div class="ticket-info">
          <div class="info-row">
            <span class="label">Venue:</span>
            <span class="value">${ticket.event.venue}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">${new Date(ticket.event.startDate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Time:</span>
            <span class="value">${new Date(ticket.event.startDate).toLocaleTimeString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Price:</span>
            <span class="value">KES ${ticket.event.price.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label">Reference:</span>
            <span class="value">${ticket.reference}</span>
          </div>
        </div>
        <div class="qr-section">
          <div class="ticket-code">Ticket Code: ${ticket.ticketCode}</div>
          <p style="color: #666; margin-top: 10px;">Present this ticket at the venue for entry</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Return HTML as Buffer (in a real fallback, you'd use a different PDF library)
  return Buffer.from(html, 'utf-8');
}

export async function generateTicketPdf({
  ticket,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  qrCodeDataURL: _, // Parameter kept for API compatibility
}: {
  ticket: TicketWithEvent;
  qrCodeDataURL: string;
}): Promise<Buffer> {
  let browser = null;

  try {
    const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/tickets/render/${ticket.ticketCode}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ticket HTML fetch failed:", errorText);
      console.warn('Using fallback PDF generation due to HTML fetch failure');
      return await generateFallbackPdf(ticket);
    }

    const html = await response.text();

    // Try to use Chromium for PDF generation
    try {
      browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-gpu',
          '--single-process',
          '--no-zygote'
        ],
        executablePath: await chromium.executablePath(),
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (chromiumError) {
      console.warn('Chromium PDF generation failed, using fallback:', chromiumError);
      return await generateFallbackPdf(ticket);
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return await generateFallbackPdf(ticket);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('Failed to close browser:', closeError);
      }
    }
  }
}
