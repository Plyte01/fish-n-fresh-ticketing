// src/app/api/admin/upload/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
  const session = await getSession();
  // Ensure user has permission to upload files. Let's use VIEW_DESIGN_TOOLS or MANAGE_EVENTS.
  if (!session || !session.permissions.some(p => ['VIEW_DESIGN_TOOLS', 'MANAGE_EVENTS'].includes(p))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await uploadImage(buffer);

    if ('secure_url' in result) {
      return NextResponse.json({ url: result.secure_url }, { status: 200 });
    } else {
      throw new Error('Cloudinary upload failed.');
    }
  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Image upload failed.' }, { status: 500 });
  }
}