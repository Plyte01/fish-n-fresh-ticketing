// src/app/api/payments/paystack/webhook/route.ts

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { sendTicketEmail } from '@/lib/email';
import { generateTicketPdf } from '@/lib/pdf';
import qrcode from 'qrcode';
import { PaymentMethod } from '@prisma/client';

const secret = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Generates a QR code image as a base64 Data URL.
 */
async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await qrcode.toDataURL(text, { width: 250 });
  } catch (err) {
    console.error("QR Code generation failed:", err);
    return ''; // Return an empty string on failure
  }
}

/**
 * Generates a unique 6-character alphanumeric ticket code.
 */
function generateTicketCode(): string {
  // A simple and effective way to get a random alphanumeric string
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Handles incoming webhook events from Paystack for successful charges.
 */
export async function POST(request: Request) {
  // 1. Verify webhook signature for security
  const requestBody = await request.text();
  const signature = (await headers()).get('x-paystack-signature');

  if (!signature) {
    console.warn('Paystack webhook is missing the x-paystack-signature header.');
    return NextResponse.json({ message: 'Signature missing' }, { status: 400 });
  }

  const hash = crypto.createHmac('sha512', secret).update(requestBody).digest('hex');
  if (hash !== signature) {
    console.warn('Invalid Paystack webhook signature received.');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  // 2. Parse event data and ensure it's a successful charge
  const eventData = JSON.parse(requestBody);

  if (eventData.event !== 'charge.success') {
    return NextResponse.json({ message: 'Ignoring non-success event' }, { status: 200 });
  }

  // Destructure all necessary data from the Paystack payload
  const { reference, amount, customer, metadata, authorization } = eventData.data;
  
  // Debug: Log the metadata to understand what we're receiving
  console.log('Paystack webhook metadata:', JSON.stringify(metadata, null, 2));
  console.log('Paystack webhook customer:', JSON.stringify(customer, null, 2));
  
  const { eventId, phone: metaPhone, email: metaEmail } = metadata;
  
  console.log('Extracted values:', { eventId, metaPhone, metaEmail, customerPhone: customer.phone });
  
  // Try to get phone number from multiple sources
  const phoneNumber = metaPhone || customer.phone || '';
  const emailAddress = metaEmail || customer.email || '';
  
  console.log('Final values to use:', { phoneNumber, emailAddress });

  // Determine the payment method from the authorization channel
  const paymentMethod: PaymentMethod = authorization.channel === 'mobile_money'
    ? PaymentMethod.PAYSTACK_MPESA
    : PaymentMethod.PAYSTACK_CARD;

  try {
    // 3. Use a single transaction to ensure atomicity
    // This block will create the Payment AND the Ticket. If either fails, both are rolled back.
    const createdTicket = await prisma.$transaction(async (tx) => {
      // Idempotency Check: Prevent processing the same payment multiple times
      const existingPayment = await tx.payment.findUnique({ where: { reference } });
      if (existingPayment) {
        console.log(`Payment reference ${reference} has already been processed. Aborting transaction.`);
        return null; // Return null to signal that we should stop.
      }

      // Create the Payment record
      const newPayment = await tx.payment.create({
        data: {
          reference,
          amount: amount / 100,
          method: paymentMethod,
          status: 'SUCCESS',
          // Use the resolved phone and email
          phone: phoneNumber,
          email: emailAddress,
          eventId: eventId,
        },
      });

      // Create the Ticket record, linking it to the new payment
      const newTicket = await tx.ticket.create({
        data: {
          ticketCode: generateTicketCode(),
          phone: phoneNumber || '', // Ensure phone is never null, use empty string as fallback
          email: emailAddress,
          eventId: newPayment.eventId,
          paymentId: newPayment.id,
        },
      });

      // Return the newly created ticket, including its related event for later use
      return tx.ticket.findUnique({
        where: { id: newTicket.id },
        include: { event: true }
      });
    });

    // If the transaction returned null, it means the payment was a duplicate. Exit gracefully.
    if (!createdTicket) {
      return NextResponse.json({ status: 'success', message: 'Event already processed.' }, { status: 200 });
    }

    // --- Side Effects (run only after the database transaction is successful) ---

    // 4. Generate QR Code and update the ticket record with it
    const qrCodeDataURL = await generateQRCodeDataURL(createdTicket.ticketCode);
    await prisma.ticket.update({
      where: { id: createdTicket.id },
      data: { qrCodeUrl: qrCodeDataURL },
    });

    // 5. Generate the ticket PDF
    const pdfBuffer = await generateTicketPdf({
      ticket: createdTicket,
      qrCodeDataURL,
    });


    // 6. Deliver Ticket via all channels
    const smsMessage = `Your ticket for ${createdTicket.event.name} is confirmed! Your ticket code is: ${createdTicket.ticketCode}.`;
    
    // Only send SMS if we have a phone number
    if (createdTicket.phone && createdTicket.phone.trim() !== '') {
      await sendSms(createdTicket.phone, smsMessage);
    } else {
      console.log('No phone number available for SMS delivery');
    }

    if (createdTicket.email && pdfBuffer) {
      // Pass the updated ticket data to the email function
      const ticketForEmail = { ...createdTicket, qrCodeUrl: qrCodeDataURL };
      await sendTicketEmail({
        ticket: ticketForEmail,
        qrCodeDataURL,
        pdfBuffer,
      });
    }

    // 7. Acknowledge successful processing to Paystack
    return NextResponse.json({ status: 'success', message: 'Webhook processed successfully.' }, { status: 200 });

  } catch (error: unknown) {
    console.error('Paystack webhook processing failed:', error);
    return NextResponse.json({ error: 'Internal Server Error during webhook processing.' }, { status: 500 });
  }
}