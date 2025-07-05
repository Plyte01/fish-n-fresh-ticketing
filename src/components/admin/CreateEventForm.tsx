// src/components/admin/CreateEventForm.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUploader } from "./ImageUploader";

const formSchema = z.object({
  name: z.string().min(3, { message: "Event name must be at least 3 characters." }),
  venue: z.string().min(3, { message: "Venue must be at least 3 characters." }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
  price: z.coerce.number().min(0, { message: "Price must be 0 or more." }),
  isFeatured: z.boolean().optional(),
  bannerImage: z.string().url({ message: "Must be a valid image URL." }).optional().or(z.literal('')),
  aboutHtml: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CreateEventFormProps = {
  onSuccess: () => void;
};

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  // No more useToast() hook!
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      venue: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default to 2 hours later
      price: 0,
      isFeatured: false,
      bannerImage: "",
      aboutHtml: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Show a loading toast
    const promise = fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    toast.promise(promise, {
      loading: 'Creating event...',
      success: (response) => {
        if (!response.ok) {
          // Manually throw to trigger the error state in the toast
          throw new Error('Failed to create event.');
        }
        onSuccess(); // Close dialog and refresh data
        form.reset();
        return 'Event created successfully!';
      },
      error: 'Error: Could not create event.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Summer Tech Conference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Grand Expo Center" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Price (KES)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={
                      field.value
                        ? new Date(
                            field.value.getTime() - field.value.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      const localDate = new Date(e.target.value);
                      field.onChange(localDate);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date & Time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    value={
                      field.value
                        ? new Date(
                            field.value.getTime() - field.value.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) => {
                      const localDate = new Date(e.target.value);
                      field.onChange(localDate);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-background/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Feature on Homepage</FormLabel>
                <p className="text-sm text-muted-foreground">
                  If enabled, this event will appear on the main homepage.
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-medium">Event Page Customization</h3>
          <p className="text-sm text-muted-foreground">
            These settings customize the specific landing page for this event.
          </p>
        </div>

        <ImageUploader name="bannerImage" label="Event Banner Image" />

        <FormField
          control={form.control}
          name="aboutHtml"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About This Event</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Write a short description about this event..."
                  className="min-h-[120px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? "Creating Event..." : "Create Event"}
        </Button>
      </form>
    </Form>
  );
}