// src/app/api/payments/paystack/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyPaystackTransaction } from '@/lib/payment';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
  }

  try {
    const ticket = await verifyPaystackTransaction(reference);
    return NextResponse.json(ticket);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Handle different types of errors with appropriate status codes
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    } else if (errorMessage.includes('not successful')) {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    } else if (errorMessage.includes('Maximum retries exceeded') || 
               errorMessage.includes('ECONNRESET') || 
               errorMessage.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Unable to verify payment due to network issues. Please try again later.' 
      }, { status: 503 });
    } else {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}