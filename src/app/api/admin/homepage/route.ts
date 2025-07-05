// src/app/api/admin/homepage/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const settingsSchema = z.object({
  bannerImage: z.string().url().optional().or(z.literal('')),
  themeColor: z.string().optional(),
  aboutHtml: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactAddress: z.string().optional(),
  contactHours: z.string().optional(),
});

/**
 * GET: Fetch current site settings
 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
    });
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PATCH: Update site settings
 * Requires VIEW_DESIGN_TOOLS permission
 */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || !session.permissions.includes('VIEW_DESIGN_TOOLS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = settingsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const updatedSettings = await prisma.siteSettings.update({
      where: { id: 'singleton' },
      data: validation.data,
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Failed to update site settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}