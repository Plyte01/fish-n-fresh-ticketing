// src/app/payment/success/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { CheckCircle, Download, Home as HomeIcon, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define a precise type for the data we expect from our API
type TicketInfo = {
  id: string;
  ticketCode: string;
  email: string | null;
  phone: string;
  event: {
    name: string;
  };
};

/**
 * The main content of the success page. Handles data fetching and state management.
 */
function SuccessPageContent() {
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get('tx_ref');

  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track polling attempts to prevent infinite loops
  const attempts = useRef(0);

  useEffect(() => {
    if (!tx_ref) {
      setError('Missing transaction reference.');
      setIsLoading(false);
      return;
    }

    const verifyAndFetch = async () => {
      attempts.current += 1;
      try {
        // Use the correct API path for verification
        const response = await fetch(`/api/payments/paystack/verify?reference=${tx_ref}`);
        const data = await response.json();
        
        // If the fetch is successful, we have the ticket data. Stop polling.
        if (response.ok) {
          setTicket(data);
          setIsLoading(false);
          return;
        }
        
        // If the ticket is not found (404), but we haven't tried too many times, poll again.
        if (response.status === 404 && attempts.current < 5) {
          console.log(`Attempt ${attempts.current}: Ticket not found yet, retrying in 2 seconds...`);
          setTimeout(verifyAndFetch, 2000);
        } else {
          // If it's another error, or we've exhausted our retries, show an error.
          throw new Error(data.error || 'Failed to verify payment after multiple attempts.');
        }
      } catch (err: unknown) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    };
    
    // Start the first verification attempt.
    verifyAndFetch();
    
  }, [tx_ref]);

  // --- UI Rendering Functions for each state ---

  const renderLoadingState = () => (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="text-2xl font-bold">Verifying Your Payment</h1>
      <p className="text-muted-foreground">Please wait a moment, this won&apos;t take long...</p>
    </div>
  );

  const renderErrorState = () => (
    <Card className="w-full max-w-md text-center shadow-lg">
      <CardHeader className="items-center">
        <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
            <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <CardTitle className="mt-4 text-2xl text-red-600">Payment Verification Failed</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild className="w-full">
          <Link href="/"><HomeIcon className="mr-2 h-4 w-4" /> Go to Homepage
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  const renderSuccessState = () => (
    <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-left">
            <p className="text-center text-muted-foreground pb-2">
                Your ticket for <strong>{ticket?.event.name}</strong> is confirmed. An email with the PDF ticket attached has been sent to you.
            </p>
            <Separator />
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium text-right">{ticket?.event.name}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-right">{ticket?.email}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket Code:</span>
                <span className="font-mono bg-gray-100 p-1 rounded-sm text-sm">{ticket?.ticketCode}</span>
            </div>
            <div className="pt-4 flex flex-col gap-2">
                <Button asChild className="w-full">
                    <Link href={`/api/tickets/download?code=${ticket?.ticketCode}`} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Download Ticket PDF
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                        <HomeIcon className="mr-2 h-4 w-4" /> Back to Homepage
                    </Link>
                </Button>
            </div>
        </CardContent>
    </Card>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      {isLoading ? renderLoadingState() : error ? renderErrorState() : renderSuccessState()}
    </div>
  );
}

/**
 * The main page export. Wraps the interactive content in a Suspense boundary
 * to allow the use of `useSearchParams` without affecting static rendering.
 */
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}