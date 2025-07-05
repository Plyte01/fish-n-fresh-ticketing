// src/lib/payment.ts
import axios from 'axios';
import { prisma } from './prisma';

const PAYSTACK_API_URL = 'https://api.paystack.co';
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Initiates a payment transaction with Paystack for the redirect fallback flow.
 * @returns The authorization data from Paystack, including the checkout URL.
 */
export async function initiatePaystackTransaction(
  email: string,
  amount: number, // Amount in kobo/cents
  metadata: Record<string, unknown>
) {
  try {
    const response = await axios.post(
      `${PAYSTACK_API_URL}/transaction/initialize`,
      {
        email,
        amount,
        currency: 'KES',
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.status) {
      throw new Error(response.data.message || 'Paystack API returned an error during initiation.');
    }

    return response.data.data;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: string } }).response?.data === "string"
    ) {
      console.error("Paystack initiation library error:", (error as { response: { data: string } }).response.data);
    } else {
      console.error("Paystack initiation library error:", error instanceof Error ? error.message : error);
    }
    throw new Error('Failed to initiate redirect payment transaction.');
  }
}
export async function verifyPaystackTransaction(reference: string) {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data: paystackData } = await axios.get(
        `${PAYSTACK_API_URL}/transaction/verify/${reference}`,
        { 
          headers: { Authorization: `Bearer ${paystackSecretKey}` },
          timeout: 10000, // 10 seconds timeout
        }
      );
      
      if (paystackData.data.status !== 'success') {
        throw new Error('Payment was not successful according to Paystack.');
      }

      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: {
          ticket: {
            include: {
              event: { select: { name: true } },
            },
          },
        },
      });

      if (!payment || !payment.ticket) {
        throw new Error('Payment verified, but ticket not found in our system. It may still be processing.');
      }

      return payment.ticket;
    } catch (error: unknown) {
      const isNetworkError = error instanceof Error && 
        (error.message.includes('ECONNRESET') || 
         error.message.includes('ETIMEDOUT') || 
         error.message.includes('ENOTFOUND') ||
         error.message.includes('timeout'));

      console.error(
        `Paystack verification attempt ${attempt}/${maxRetries} failed:`,
        error instanceof Error ? error.message : error
      );

      // If it's a network error and we have retries left, wait and retry
      if (isNetworkError && attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // If it's not a network error or we've exhausted retries, throw the error
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error('Maximum retries exceeded');
}