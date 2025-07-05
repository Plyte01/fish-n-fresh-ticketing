// src/app/api/tickets/render/[ticketCode]/route.tsx

import { prisma } from '@/lib/prisma';
import { Ticket, Event } from '@prisma/client';

type TicketWithEvent = Ticket & { event: Event };

function generateTicketHTML(ticket: TicketWithEvent, qrCodeDataURL: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticket - ${ticket.event.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; }
    .container { max-width: 600px; margin: 20px auto; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .header { background-color: #1a202c; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 25px; }
    .content h2 { font-size: 20px; color: #2d3748; margin: 0 0 20px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .info-item p { margin: 0; color: #718096; font-size: 14px; }
    .info-item span { color: #2d3748; font-weight: 600; font-size: 16px; }
    .qr-section { text-align: center; margin-top: 25px; }
    .qr-section p { margin: 0 0 10px 0; color: #718096; font-size: 14px; }
    .qr-section code { background-color: #edf2f7; padding: 5px 10px; border-radius: 4px; font-size: 18px; font-family: "Courier New", Courier, monospace; letter-spacing: 2px; }
    .qr-section img { margin-top: 15px; border: 5px solid #e2e8f0; border-radius: 4px; }
    .footer { text-align: center; font-size: 12px; color: #a0aec0; padding: 20px; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Ticket</h1>
    </div>
    <div class="content">
      <h2>${ticket.event.name}</h2>
      <div class="info-grid">
        <div class="info-item"><p>Venue</p><span>${ticket.event.venue}</span></div>
        <div class="info-item"><p>Date</p><span>${new Date(ticket.event.startDate).toLocaleString()}</span></div>
        <div class="info-item"><p>Email</p><span>${ticket.email}</span></div>
        ${ticket.phone && ticket.phone.trim() ? `<div class="info-item"><p>Phone</p><span>${ticket.phone}</span></div>` : ''}
      </div>
      <div class="qr-section">
        <p>Ticket Code</p>
        <code>${ticket.ticketCode}</code>
        <br>
        <img src="${qrCodeDataURL}" width="200" height="200" alt="Ticket QR Code">
      </div>
    </div>
    <div class="footer">
      Thank you for using FISH&apos;N FRESH Ticketing.
    </div>
  </div>
</body>
</html>`;
}

/**
 * API route that renders a ticket as HTML for PDF generation
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  try {
    const { ticketCode } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: { event: true },
    });

    if (!ticket || !ticket.qrCodeUrl) {
      return new Response('Ticket not found', { status: 404 });
    }

    // Generate the ticket HTML using our template function
    const html = generateTicketHTML(ticket, ticket.qrCodeUrl);

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (err) {
    console.error('Render route error:', err);
    return new Response('Failed to render ticket HTML', { status: 500 });
  }
}
