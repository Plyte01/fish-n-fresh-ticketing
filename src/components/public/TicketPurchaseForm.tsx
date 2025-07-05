// src/components/public/TicketPurchaseForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Event } from "@prisma/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Ticket as TicketIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the PaymentButton to ensure it only loads on the client-side.
// This prevents "window is not defined" errors during server-side rendering.
const PaymentButton = dynamic(() =>
  import('./PaymentButton').then(mod => mod.PaymentButton),
  {
    // Show a skeleton loader while the interactive button is loading.
    loading: () => <Button className="w-full" disabled><Skeleton className="h-5 w-48" /></Button>,
    ssr: false, // Explicitly disable server-side rendering for this component.
  }
);

// Define the form validation schema using Zod.
const phoneRegex = new RegExp(/^254\d{9}$/); // Matches Kenyan phone numbers like 2547...
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().regex(phoneRegex, { message: "Phone must be in the format 254xxxxxxxxx." }),
  terms: z.literal<boolean>(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions to proceed." }),
  }),
});

/**
 * A unified form for users to enter their details before purchasing a ticket.
 * It validates user input and then delegates all payment handling to the PaymentButton component.
 */
export function TicketPurchaseForm({ event }: { event: Event }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate fields as the user types for instant feedback.
    defaultValues: {
      email: "",
      phone: "",
      terms: false,
    },
  });

  const { formState, watch } = form;
  const formData = watch(); // Watch form values to pass them to the PaymentButton.

  return (
    <Card className="shadow-xl border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
          <TicketIcon className="h-6 w-6" /> Get Your Ticket
        </CardTitle>
        <CardDescription>
          Price:{' '}
          <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">KES {event.price.toFixed(2)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (for M-Pesa & Ticket)</FormLabel>
                  <FormControl>
                    <Input placeholder="254712345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the{' '}
                      <Link
                        href="/terms"
                        className="underline hover:text-primary"
                        target="_blank"
                      >
                        terms and conditions
                      </Link>
                      .
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            {/* The single, unified PaymentButton handles all payment methods */}
            <div className="pt-4">
              <PaymentButton
                email={formData.email}
                phone={formData.phone}
                amount={event.price}
                eventId={event.id}
                disabled={!formState.isValid} // Button is only enabled when the form is valid.
              />
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}