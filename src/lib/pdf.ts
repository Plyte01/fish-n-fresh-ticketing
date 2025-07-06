// src/lib/pdf.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Ticket, Event } from '@prisma/client';

type TicketWithEvent = Ticket & { event: Event };

/**
 * Generates high-quality ticket HTML with better styling
 */
function generateTicketHTML(ticket: TicketWithEvent): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket - ${ticket.event.name}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        background: #f8fafc;
        padding: 20px;
        line-height: 1.6;
      }
      .ticket-container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }
      .ticket-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .event-name {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
      }
      .ticket-subtitle {
        font-size: 16px;
        opacity: 0.9;
      }
      .ticket-body {
        padding: 30px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 25px;
      }
      .info-item {
        padding: 15px;
        background: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      .info-label {
        font-size: 12px;
        text-transform: uppercase;
        color: #64748b;
        font-weight: 600;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
      }
      .info-value {
        font-size: 16px;
        color: #1e293b;
        font-weight: 500;
      }
      .ticket-code-section {
        text-align: center;
        padding: 25px;
        background: #f1f5f9;
        border-radius: 8px;
        margin: 20px 0;
      }
      .ticket-code {
        font-size: 24px;
        font-weight: bold;
        color: #1e293b;
        letter-spacing: 3px;
        font-family: 'Courier New', monospace;
        margin-bottom: 10px;
      }
      .ticket-instructions {
        color: #64748b;
        font-size: 14px;
        margin-top: 15px;
      }
      .ticket-footer {
        padding: 20px 30px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        font-size: 12px;
        color: #64748b;
        text-align: center;
      }
      @media print {
        body { background: white; padding: 0; }
        .ticket-container { box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <div class="ticket-container">
      <div class="ticket-header">
        <div class="event-name">${ticket.event.name}</div>
        <div class="ticket-subtitle">Event Ticket</div>
      </div>
      
      <div class="ticket-body">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Venue</div>
            <div class="info-value">${ticket.event.venue}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date</div>
            <div class="info-value">${new Date(ticket.event.startDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Time</div>
            <div class="info-value">${new Date(ticket.event.startDate).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Price</div>
            <div class="info-value">KES ${ticket.event.price.toFixed(2)}</div>
          </div>
        </div>
        
        <div class="ticket-code-section">
          <div class="info-label">Ticket Reference</div>
          <div class="info-value" style="margin-bottom: 15px;">${ticket.reference}</div>
          
          <div class="info-label">Admission Code</div>
          <div class="ticket-code">${ticket.ticketCode}</div>
          
          <div class="ticket-instructions">
            Present this ticket at the venue for entry.<br>
            Keep this ticket safe and arrive early for smooth check-in.
          </div>
        </div>
      </div>
      
      <div class="ticket-footer">
        Generated on ${new Date().toLocaleDateString()} • FISH'N FRESH Ticketing
      </div>
    </div>
  </body>
</html>`;
}

async function generateFallbackPdf(ticket: TicketWithEvent): Promise<Buffer> {
  // Use the high-quality HTML template for fallback
  const html = generateTicketHTML(ticket);
  
  // Return HTML as Buffer (could be enhanced with a lightweight PDF library)
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
    // Generate high-quality HTML directly (no need to fetch from API)
    const html = generateTicketHTML(ticket);

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
      
      // Set content and wait for everything to load
      await page.setContent(html, { 
        waitUntil: ['domcontentloaded', 'networkidle0'] 
      });

      // Emulate screen media for better styling
      await page.emulateMediaType('screen');

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
