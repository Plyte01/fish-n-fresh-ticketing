/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-head-element */
// src/components/tickets/TicketTemplate.tsx
import { Ticket, Event } from '@prisma/client';
import React from 'react';

type TicketWithEvent = Ticket & { event: Event };

interface TicketTemplateProps {
  ticket: TicketWithEvent;
  qrCodeDataURL: string;
}

// Note: We use inline styles here because when this is rendered to a string for the PDF,
// external CSS files won't be applied. Inline styles are the most reliable method.
export const TicketTemplate = ({ ticket, qrCodeDataURL }: TicketTemplateProps) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <style>{`
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 0; padding: 0; background-color: #f0f2f5; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .header { background-color: #1a202c; color: white; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 25px; }
        .content h2 { font-size: 20px; color: #2d3748; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .info-item p { margin: 0; color: #718096; font-size: 14px; }
        .info-item span { color: #2d3748; font-weight: 600; font-size: 16px; }
        .qr-section { text-align: center; margin-top: 25px; }
        .qr-section code { background-color: #edf2f7; padding: 5px 10px; border-radius: 4px; font-size: 18px; font-family: "Courier New", Courier, monospace; letter-spacing: 2px; }
        .qr-section img { margin-top: 15px; border: 5px solid #e2e8f0; border-radius: 4px; }
        .footer { text-align: center; font-size: 12px; color: #a0aec0; padding: 20px; border-top: 1px solid #e0e0e0; }
      `}</style>
    </head>
    <body>
      <div className="container">
        <div className="header">
          <h1>Your Ticket</h1>
        </div>
        <div className="content">
          <h2>{ticket.event.name}</h2>
          <div className="info-grid">
            <div className="info-item"><p>Venue</p><span>{ticket.event.venue}</span></div>
            <div className="info-item"><p>Date</p><span>{new Date(ticket.event.startDate).toLocaleString()}</span></div>
            <div className="info-item"><p>Email</p><span>{ticket.email}</span></div>
            {ticket.phone && ticket.phone.trim() && (
              <div className="info-item"><p>Phone</p><span>{ticket.phone}</span></div>
            )}
          </div>
          <div className="qr-section">
            <p>Ticket Code</p>
            <code>{ticket.ticketCode}</code>
            <br />
            <img src={qrCodeDataURL} width="200" height="200" alt="Ticket QR Code" />
          </div>
        </div>
        <div className="footer">
          Thank you for using FISH&apos;N FRESH Ticketing.
        </div>
      </div>
    </body>
  </html>
);