// src/types/paystack.d.ts

/**
 * This declaration file provides TypeScript types for the '@paystack/inline-js'
 * library, which does not ship with its own types.
 */
declare module '@paystack/inline-js' {
  import React from 'react';

  /**
   * Defines the shape of the configuration object passed to the usePaystackPayment hook.
   */
  export interface PaystackProps {
    publicKey: string;
    email: string;
    amount: number; // Amount in the smallest currency unit (e.g., kobo, cents)
    phone?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    currency?: 'NGN' | 'GHS' | 'USD' | 'ZAR' | 'KES';
    channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
    label?: string;
    plan?: string;
    quantity?: number;
    subaccount?: string;
    transaction_charge?: number;
    bearer?: 'account' | 'subaccount';
  }

  /**
   * Defines the shape of the object returned in the onSuccess callback.
   */
  export interface PaystackTransaction {
    message: string;
    reference: string;
    status: 'success' | 'failed';
    trans: string;
    transaction: string;
    trxref: string;
  }

  /**
   * Declares the usePaystackPayment hook as the default export of the module.
   */
  const usePaystackPayment: (props: PaystackProps) => (
    onSuccess?: (response: PaystackTransaction) => void,
    onClose?: () => void
  ) => void;
  
  export default usePaystackPayment;

  /**
   * (Optional but good to have) Declares the PaystackConsumer component.
   */
  export const PaystackConsumer: React.FC<{
    config: PaystackProps,
    onSuccess?: (response: PaystackTransaction) => void,
    onClose?: () => void,
    children: React.ReactNode
  }>;
}