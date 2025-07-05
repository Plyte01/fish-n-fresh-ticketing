// src/components/emails/TicketEmail.tsx

import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from '@react-email/components';
import { Ticket, Event } from '@prisma/client';

// Define the shape of the props, combining Ticket and Event for convenience.
type TicketWithEvent = Ticket & { event: Event };

interface TicketEmailProps {
  ticket: TicketWithEvent;
  qrCodeDataURL: string;
}

/**
 * The React component for the ticket confirmation email.
 * Uses @react-email/components to ensure cross-client compatibility.
 */
export const TicketEmail = ({ ticket, qrCodeDataURL }: TicketEmailProps) => (
  <Html>
    <Head />
    <Preview>Your ticket for {ticket.event.name} is here!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Your Ticket is Confirmed!</Heading>
        <Text style={paragraph}>Hi there,</Text>
        <Text style={paragraph}>
          Thank you for your purchase. Here is your ticket for{' '}
          <strong>{ticket.event.name}</strong>. Please have this ready for scanning at the event entrance.
          You can show this email or the attached PDF.
        </Text>

        {/* The main ticket information block */}
        <Section style={ticketSection}>
          <Text style={ticketHeader}>{ticket.event.name}</Text>
          <Text><strong>Venue:</strong> {ticket.event.venue}</Text>
          <Text><strong>Date:</strong> {new Date(ticket.event.startDate).toLocaleString()}</Text>
          <hr style={hr} />
          <Text><strong>Ticket Code:</strong> <code style={code}>{ticket.ticketCode}</code></Text>
          <Text><strong>Email:</strong> {ticket.email}</Text>
          <Img src={qrCodeDataURL} width="200" height="200" alt="Ticket QR Code" style={qrCode} />
        </Section>

        <Text style={footer}>
          See you at the event! This is an automated message.
          If you have questions, please contact the event organizer directly.
        </Text>
      </Container>
    </Body>
  </Html>
);

// --- Styles for the email components ---
// Inline styles are used for maximum compatibility with email clients.
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  width: '580px',
  border: '1px solid #e6e6e6',
  borderRadius: '5px',
};
const heading = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  marginTop: '48px',
  textAlign: 'center' as const,
};
const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'left' as const,
  padding: '0 20px',
};
const ticketSection = {
  padding: '20px',
  margin: '20px',
  border: '1px dashed #cccccc',
  borderRadius: '5px',
};
const ticketHeader = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  margin: '0 0 10px 0',
};
const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};
const code = {
  backgroundColor: '#f0f0f0',
  padding: '4px 8px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
};
const qrCode = {
  display: 'block',
  margin: '20px auto',
};
const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 20px',
};