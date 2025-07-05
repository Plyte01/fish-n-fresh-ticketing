// src/app/api/payments/paystack/initiate/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initiatePaystackTransaction } from '@/lib/payment';
import { z } from 'zod';

// Validate incoming payload using Zod
const PayloadSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  amount: z.number().positive(), // amount in KES cents
  eventId: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload.', details: parsed.error.format() }, { status: 400 });
    }

    const { email, phone, eventId, amount } = parsed.data;

    // Fetch event
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    const expectedAmount = Math.round(event.price * 100); // Convert KES to kobo
    if (expectedAmount !== amount) {
      return NextResponse.json({ error: 'Amount mismatch.' }, { status: 400 });
    }

    // Prepare metadata for Paystack dashboard visibility
    const metadata = {
      eventId,
      phone,
      customer_email: email,
      event_name: event.name
    };

    const authorizationData = await initiatePaystackTransaction(email, amount, metadata);

    if (!authorizationData?.authorization_url) {
      return NextResponse.json({ error: 'Failed to generate Paystack authorization link.' }, { status: 500 });
    }

    return NextResponse.json(authorizationData);

  } catch (error: unknown) {
    console.error("Paystack redirect error:", error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
