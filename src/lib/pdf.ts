// src/lib/pdf.ts

import puppeteer, { Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Ticket, Event } from '@prisma/client';
import qrcode from 'qrcode';
import { jsPDF } from 'jspdf';

type TicketWithEvent = Ticket & { event: Event };

function generateTicketHTML(ticket: TicketWithEvent, qrCodeDataURL: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${ticket.event.name} – Ticket</title>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        padding: 40px;
        background-color: #f9fafb;
        color: #1f2937;
      }
      .ticket {
        width: 100%;
        max-width: 1000px;
        margin: auto;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 0 30px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: row;
      }
      .left {
        flex: 2;
        padding: 40px;
      }
      .right {
        flex: 1;
        background: #f1f5f9;
        padding: 30px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .event-name {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 10px;
        color: #334155;
      }
      .label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .value {
        font-size: 16px;
        margin-bottom: 20px;
        color: #1e293b;
      }
      .code-box {
        text-align: center;
        margin-top: 30px;
        background: #e0f2fe;
        padding: 16px;
        border-radius: 8px;
      }
      .ticket-code {
        font-size: 24px;
        font-family: monospace;
        color: #0284c7;
        font-weight: bold;
        letter-spacing: 2px;
      }
      .qr {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .qr img {
        border: 2px solid #94a3b8;
        border-radius: 8px;
        padding: 5px;
        background: #fff;
        width: 130px;
        height: 130px;
        margin: 10px auto;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #94a3b8;
        margin-top: 40px;
      }
    </style>
  </head>
  <body>
    <div class="ticket">
      <div class="left">
        <div class="event-name">${ticket.event.name}</div>

        <div class="label">Venue</div>
        <div class="value">${ticket.event.venue}</div>

        <div class="label">Date</div>
        <div class="value">${new Date(ticket.event.startDate).toLocaleDateString('en-US')}</div>

        <div class="label">Time</div>
        <div class="value">${new Date(ticket.event.startDate).toLocaleTimeString('en-US')}</div>

        <div class="label">Price</div>
        <div class="value">KES ${ticket.event.price.toFixed(2)}</div>

        <div class="label">Reference</div>
        <div class="value">${ticket.reference}</div>

        <div class="code-box">
          <div class="label">Admission Code</div>
          <div class="ticket-code">${ticket.ticketCode}</div>
        </div>
      </div>
      <div class="right">
        <div class="qr">
          <div class="label">Scan to Verify</div>
          <img src="${qrCodeDataURL}" alt="QR Code" />
        </div>
        <div class="footer">
          Present this ticket at the venue for entry.<br/>
          Generated on ${new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function generateFallbackPdf(ticket: TicketWithEvent, qrCodeDataURL?: string): Promise<Buffer> {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a6' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FISH\'N FRESH TICKET', 15, 15);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Event: ${ticket.event.name}`, 15, 25);
  pdf.text(`Venue: ${ticket.event.venue}`, 15, 32);
  pdf.text(`Date: ${new Date(ticket.event.startDate).toLocaleDateString()}`, 15, 39);
  pdf.text(`Time: ${new Date(ticket.event.startDate).toLocaleTimeString()}`, 15, 46);
  pdf.text(`Price: KES ${ticket.event.price.toFixed(2)}`, 15, 53);
  pdf.text(`Code: ${ticket.ticketCode}`, 15, 60);
  //pdf.text(`Ref: ${ticket.reference}`, 15, 67);

  if (qrCodeDataURL) {
    // A6 page is 105mm x 148mm, QR code is 40x40mm
    // Center horizontally: (105 - 40) / 2 = 32.5mm
    // Position vertically: 75mm (keeping some space from text above)
    pdf.addImage(qrCodeDataURL, 'PNG', 32.5, 75, 40, 40);
    
    // Add centered label above QR code
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SCAN TO VERIFY', 52.5, 72, { align: 'center' });
  }

  return Buffer.from(pdf.output('arraybuffer'));
}

export async function generateTicketPdf({
  ticket,
  qrCodeDataURL,
}: {
  ticket: TicketWithEvent;
  qrCodeDataURL?: string;
}): Promise<Buffer> {
  let browser: Browser | null = null;
  let finalQr = qrCodeDataURL;

  try {
    if (!finalQr) {
      finalQr = await qrcode.toDataURL(ticket.ticketCode);
    }

    const html = generateTicketHTML(ticket, finalQr);

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    return Buffer.from(pdfBuffer);
  } catch (err) {
    console.warn('🧾 Falling back to jsPDF fallback:', err);
    return await generateFallbackPdf(ticket, finalQr);
  } finally {
    if (browser) await browser.close();
  }
}
