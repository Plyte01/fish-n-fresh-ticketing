// src/app/api/public/site-settings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET: Fetch public site settings (no authentication required)
 * Returns only the contact information and other public fields
 */
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        contactEmail: true,
        contactPhone: true,
        contactAddress: true,
        contactHours: true,
        metaTitle: true,
        metaDescription: true,
        bannerImage: true,
        aboutHtml: true,
      },
    });

    // Return empty object if no settings found
    if (!settings) {
      return NextResponse.json({
        contactEmail: null,
        contactPhone: null,
        contactAddress: null,
        contactHours: null,
        metaTitle: null,
        metaDescription: null,
        bannerImage: null,
        aboutHtml: null,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch public site settings:", error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
