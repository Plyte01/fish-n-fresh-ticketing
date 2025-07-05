// src/app/admin/design/page.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form"; // Correctly import both from 'react-hook-form'
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { SiteSettings } from "@prisma/client";
import { ImageUploader } from '@/components/admin/ImageUploader'; // Import our new component
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// The Zod schema updated to include contact fields
const formSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  bannerImage: z.string().url({ message: 'A valid URL is required for the banner.' }).optional().or(z.literal('')),
  aboutHtml: z.string().optional(),
  contactEmail: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  contactHours: z.string().optional(),
});

export default function HomepageDesignerPage() {
  // Use a single `useForm` hook. We'll call it `methods` to be clear.
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metaTitle: '',
      metaDescription: '',
      bannerImage: '',
      aboutHtml: '',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      contactHours: '',
    },
  });

  // Fetch initial data and populate the form
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch('/api/admin/homepage');
        const rawData: SiteSettings = await response.json();

        // Transform the data to match the form schema
        const formSafeData = {
          bannerImage: rawData.bannerImage ?? '',
          aboutHtml: rawData.aboutHtml ?? '',
          metaTitle: rawData.metaTitle ?? '',
          metaDescription: rawData.metaDescription ?? '',
          contactEmail: rawData.contactEmail ?? '',
          contactPhone: rawData.contactPhone ?? '',
          contactAddress: rawData.contactAddress ?? '',
          contactHours: rawData.contactHours ?? '',
        };

        methods.reset(formSafeData);
      } catch (error) {
        console.error('Failed to load homepage settings:', error);
        toast.error("Failed to load homepage settings.");
      }
    }

    fetchSettings();
  }, [methods]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise = fetch('/api/admin/homepage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: 'Homepage settings updated successfully!',
      error: 'Error: Could not save settings.',
    });
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Homepage Designer</h1>
      {/* 
        Wrap the entire form in <FormProvider>.
        This gives any child component (like ImageUploader) access to the form's context.
      */}
      <FormProvider {...methods}>
        {/*
          The <Form> component from Shadcn is for styling and context, but we use our own `onSubmit`.
          Pass `methods` to the Shadcn <Form> component via the spread operator.
        */}
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            {/* SEO Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">SEO & Meta Information</h2>
              <FormField control={methods.control} name="metaTitle" render={({ field }) => (<FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input placeholder="FISH'N FRESH | Buy Tickets" {...field} /></FormControl><FormMessage /></FormItem>)} />

              <FormField control={methods.control} name="metaDescription" render={({ field }) => (<FormItem><FormLabel>SEO Meta Description</FormLabel><FormControl><Textarea placeholder="The best place to find and buy tickets for local events." {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* Banner Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">Homepage Banner</h2>
              {/* 
                REPLACE the old FormField for 'bannerImage' with our new ImageUploader component.
                It will automatically connect to the form via context.
              */}
              <ImageUploader name="bannerImage" label="Homepage Banner" />
            </div>

            {/* About Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">About Section</h2>
              <FormField control={methods.control} name="aboutHtml" render={({ field }) => (<FormItem><FormLabel>About Section (HTML allowed)</FormLabel><FormControl><Textarea placeholder="<p>Welcome to our platform...</p>" rows={8} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b pb-2">Contact Information</h2>
              <FormField control={methods.control} name="contactEmail" render={({ field }) => (<FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="info@fishnfresh.com" {...field} /></FormControl><FormMessage /></FormItem>)} />

              <FormField control={methods.control} name="contactPhone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+1 (555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>)} />

              <FormField control={methods.control} name="contactAddress" render={({ field }) => (<FormItem><FormLabel>Contact Address</FormLabel><FormControl><Textarea placeholder="123 Main Street, City, State 12345" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />

              <FormField control={methods.control} name="contactHours" render={({ field }) => (<FormItem><FormLabel>Business Hours</FormLabel><FormControl><Textarea placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <Button type="submit" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}