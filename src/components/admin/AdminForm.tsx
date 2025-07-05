'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Permission } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelectPermissions } from './MultiSelectPermissions';

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required." }),
  email: z.string().email(),
  password: z.string().optional(),
  permissionIds: z.array(z.string()).min(1, { message: "At least one permission must be selected." }),
});

type AdminFormProps = {
  onSuccess: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  allPermissions: Permission[];
};

export function AdminForm({ onSuccess, initialData, allPermissions }: AdminFormProps) {
  const isEditMode = !!initialData;
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      password: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      permissionIds: initialData?.permissions?.map((p: any) => p.permission.id) || [],
    },
  });

  const { formState: { errors } } = methods;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isEditMode && (!values.password || values.password.length < 8)) {
      methods.setError('password', { type: 'manual', message: 'Password must be at least 8 characters for new admins.' });
      return;
    }

    if (isEditMode && values.password && values.password.length > 0 && values.password.length < 8) {
      methods.setError('password', { type: 'manual', message: 'New password must be at least 8 characters.' });
      return;
    }

    const url = isEditMode ? `/api/admin/admins/${initialData.id}` : '/api/admin/admins';
    const method = isEditMode ? 'PATCH' : 'POST';

    const promise = fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    toast.promise(promise, {
      loading: isEditMode ? 'Updating admin...' : 'Creating admin...',
      success: async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.error?.fieldErrors?.email) {
            methods.setError('email', { type: 'manual', message: errorData.error.fieldErrors.email[0] });
          }
          throw new Error(errorData.error?.formErrors?.[0] || 'Request failed.');
        }
        onSuccess();
        return `Admin ${isEditMode ? 'updated' : 'created'} successfully!`;
      },
      error: (err) => err.message || 'An unknown error occurred.',
    });
  }

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={methods.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEditMode ? 'Leave blank to keep current' : ''}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={methods.control}
            name="permissionIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormControl>
                  <MultiSelectPermissions
                    allPermissions={allPermissions}
                    selected={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                {errors.permissionIds && (
                  <p className="text-sm font-medium text-destructive pt-1">
                    {errors.permissionIds.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          <Button type="submit" disabled={methods.formState.isSubmitting}>
            {methods.formState.isSubmitting
              ? isEditMode
                ? 'Saving...'
                : 'Creating...'
              : isEditMode
              ? 'Save Changes'
              : 'Create Admin'}
          </Button>
        </form>
      </Form>
    </FormProvider>
  );
}
