// src/components/public/PaymentButton.tsx
/* eslint-disable */
// @ts-nocheck
'use client';

import PaystackPop from '@paystack/inline-js'; // ✅ Correct import
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface PaymentButtonProps {
  email: string;
  phone: string;
  amount: number; // In KES
  eventId: string;
  disabled: boolean;
}

export function PaymentButton({ email, phone, amount, eventId, disabled }: PaymentButtonProps) {
  const [isInitiating, setIsInitiating] = useState(false);

  const config = {
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    amount: Math.round(amount * 100),
    email,
    metadata: {
      eventId,
      phone, // Add phone directly to metadata
      email, // Add email directly to metadata for fallback
      custom_fields: [
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: phone,
        },
      ],
    },
    callback: (response: any) => {
      toast.success('Payment successful! Redirecting...');
      window.location.href = `/payment/success?tx_ref=${response.reference}`;
    },
    onClose: () => {
      toast.info('Payment modal closed.');
      setIsInitiating(false);
    },
  };

  const handleModalPayment = () => {
    setIsInitiating(true);
    const paystack = new PaystackPop(); // ✅ Correct usage
    paystack.newTransaction(config);
  };

  const handleRedirectPayment = async () => {
    setIsInitiating(true);
    toast.loading('Preparing a secure redirect...');
    try {
      const response = await fetch('/api/payments/paystack/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, eventId, amount: Math.round(amount * 100) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast.error(error.message);
      setIsInitiating(false);
    }
  };

  return (
    <div className="space-y-2 pt-4">
      <Button
        type="button"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 eventful-pulse"
        onClick={handleModalPayment}
        disabled={disabled || isInitiating}
      >
        {isInitiating ? 'Processing...' : 'Purchase Ticket'}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Modal not working?{' '}
        <button
          type="button"
          onClick={handleRedirectPayment}
          className="underline hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50 transition-colors"
          disabled={disabled || isInitiating}
        >
          Use Secure Redirect.
        </button>
      </p>
    </div>
  );
}
