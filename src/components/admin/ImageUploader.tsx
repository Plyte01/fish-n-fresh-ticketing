// src/components/admin/ImageUploader.tsx
'use client';

import { useState } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, X } from 'lucide-react';

type ImageUploaderProps = {
  name: string; // The name of the field in the form
  label: string;
};

export function ImageUploader({ name, label }: ImageUploaderProps) {
  const { control, setValue } = useFormContext();
  const { field } = useController({ name, control });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const promise = fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    toast.promise(promise, {
      loading: 'Uploading image...',
      success: async (response) => {
        if (!response.ok) {
          throw new Error('Upload failed.');
        }
        const data = await response.json();
        setValue(name, data.url, { shouldValidate: true });
        setIsUploading(false);
        return 'Image uploaded successfully!';
      },
      error: (err) => {
        setIsUploading(false);
        return `Error: ${err.message}`;
      },
    });
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="p-4 border-2 border-dashed rounded-md space-y-4">
        {field.value ? (
          <div className="relative group">
            <Image
              src={field.value}
              alt="Uploaded preview"
              width={400}
              height={200}
              className="rounded-md object-cover w-full h-48"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setValue(name, '', { shouldValidate: true })}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag & drop or click to upload
            </p>
          </div>
        )}
        <Input
          type="file"
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-foreground file:text-primary hover:file:bg-primary/20"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}