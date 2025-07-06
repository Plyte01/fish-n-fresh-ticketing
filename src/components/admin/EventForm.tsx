'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ImageUploader } from './ImageUploader';
import type { Event } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  venue: z.string().min(3, { message: "Venue must be at least 3 characters." }),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date({ required_error: "An end date is required." }),
  price: z.coerce.number().min(0, { message: "Price must be 0 or more." }),
  status: z.enum(['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED', 'DRAFT']),
  isFeatured: z.boolean(),
  bannerImage: z.string().url({ message: "Must be a valid image URL." }).optional().or(z.literal('')),
  aboutHtml: z.string().optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type EventFormValues = z.infer<typeof formSchema>;

type EventFormProps = {
  onSuccess: () => void;
  initialData?: Event | null;
};

export function EventForm({ onSuccess, initialData }: EventFormProps) {
  const isEditMode = !!initialData;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      venue: initialData?.venue ?? "",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(Date.now() + 26 * 60 * 60 * 1000), // Default to tomorrow + 2 hours
      price: initialData?.price ?? 0,
      status: initialData?.status ?? "UPCOMING",
      isFeatured: initialData?.isFeatured ?? false,
      bannerImage: initialData?.bannerImage ?? "",
      aboutHtml: initialData?.aboutHtml ?? "",
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    const url = isEditMode
      ? `/api/admin/events/${initialData!.id}`
      : '/api/admin/events';
    const method = isEditMode ? 'PATCH' : 'POST';

    // Ensure dates are properly serialized as ISO strings
    const payload = {
      ...values,
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    };

    const promise = fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    toast.promise(promise, {
      loading: isEditMode ? 'Updating event...' : 'Creating event...',
      success: async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Request failed.');
        }
        onSuccess();
        if (!isEditMode) form.reset();
        return isEditMode
          ? 'Event updated successfully!'
          : 'Event created successfully!';
      },
      error: (err) => `Error: ${err.message}`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED', 'DRAFT'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? isEditMode
              ? 'Saving Changes...'
              : 'Creating Event...'
            : isEditMode
            ? 'Save Changes'
            : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
}
