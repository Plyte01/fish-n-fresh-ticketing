// src/app/api/tickets/verify/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Verifies a payment transaction with Paystack and retrieves the associated ticket.
 * This is a public endpoint used by the frontend success page to confirm a purchase.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // The success page uses 'tx_ref', but let's also support 'reference' for flexibility.
  const reference = searchParams.get('tx_ref') || searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  try {
    // For added security, we can re-verify the transaction status with Paystack's API.
    // This ensures that even if our webhook is delayed, we don't show a success
    // message for a payment that ultimately failed.
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    );

    if (paystackResponse.data?.data?.status !== 'success') {
      return NextResponse.json({ error: 'Payment was not successful according to Paystack.' }, { status: 402 }); // 402 Payment Required
    }

    // Now, look for the payment and its associated ticket in our database.
    // The webhook is responsible for creating these records.
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: {
        ticket: {
          include: {
            // We need the event name for the success page message.
            event: { select: { name: true } },
          },
        },
      },
    });

    // If the payment or ticket is not found in our DB, it likely means the webhook
    // hasn't processed yet. Returning a 404 will trigger the polling on the frontend.
    if (!payment || !payment.ticket) {
      return NextResponse.json({ error: 'Verification successful, but ticket is still processing. Please wait a moment.' }, { status: 404 });
    }

    // If everything is found, return the complete ticket data.
    return NextResponse.json(payment.ticket);

  } catch (error: unknown) {
    // Handle cases where the transaction reference is invalid with Paystack.
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { status?: number } }).response === "object" &&
      (error as { response: { status?: number } }).response.status === 400
    ) {
      return NextResponse.json({ error: 'Invalid transaction reference.' }, { status: 400 });
    }

    console.error("Payment verification error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'An internal error occurred during verification.' }, { status: 500 });
  }
}