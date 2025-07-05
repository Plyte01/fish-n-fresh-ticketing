// src/lib/email.ts
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { TicketEmail } from '@/components/emails/TicketEmail';
import { Ticket, Event } from '@prisma/client';

type TicketWithEvent = Ticket & { event: Event };

let transporter: nodemailer.Transporter;

const emailProvider = process.env.EMAIL_PROVIDER?.toLowerCase();

// --- Conditionally Create the Nodemailer Transporter ---
if (emailProvider === 'resend') {
  // --- Resend Configuration ---
  console.log('Initializing Resend email provider...');
  transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    secure: true,
    port: 465,
    auth: {
      user: 'resend', // Fixed value
      pass: process.env.RESEND_API_KEY,
    },
  });
} else if (emailProvider === 'gmail') {
  // --- Gmail Configuration ---
  console.log('Initializing Gmail email provider...');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // This should be your App Password
    },
  });
} else {
    // --- No Provider Configured ---
    console.warn('WARNING: No EMAIL_PROVIDER configured in .env. Email sending will be disabled.');
    // Create a mock transporter that does nothing but log, to prevent crashes
    transporter = nodemailer.createTransport({
        jsonTransport: true,
    });
}


/**
 * Sends a ticket email using the dynamically configured Nodemailer transporter.
 */
export async function sendTicketEmail({ ticket, pdfBuffer, qrCodeDataURL }: { ticket: TicketWithEvent; pdfBuffer: Buffer; qrCodeDataURL: string }) {
  const fromEmail = process.env.EMAIL_FROM_ADDRESS;

  if (!emailProvider || !fromEmail) {
    console.error("Email is not configured. Please set EMAIL_PROVIDER and EMAIL_FROM_ADDRESS in your .env file.");
    return;
  }
  
  if (!ticket.email) {
    console.log(`Ticket ${ticket.ticketCode} has no email address. Skipping.`);
    return;
  }
  
  try {
    const emailHtml = await render(TicketEmail({ ticket, qrCodeDataURL }));

    const options = {
      from: fromEmail,
      to: ticket.email,
      subject: `Your Ticket for ${ticket.event.name}`,
      html: emailHtml,
      attachments: [ // <-- Add the attachments array
        {
          filename: `ticket-${ticket.ticketCode}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(options);

    // If using the jsonTransport (no provider), the output is different
    if (emailProvider) {
        console.log(`Email sent via ${emailProvider}. Message ID: ${info.messageId}`);
    } else {
        console.log("Email sending is disabled. Mock email object:", info.message);
    }
    
    return info;

  } catch (error) {
    console.error(`Failed to send email via ${emailProvider}:`, error);
  }
}