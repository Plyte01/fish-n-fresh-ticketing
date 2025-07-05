// src/app/api/public/events/[eventId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In Next.js App Router, `params` is a Promise
type ParamsPromise = Promise<{ eventId: string }>;

export async function GET(
  _request: Request,
  { params }: { params: ParamsPromise }
) {
  const { eventId } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
        status: { in: ['UPCOMING', 'LIVE'] }, // Only show purchasable events
      },
      // Select only the fields needed for the public page
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        venue: true,
        price: true,
        bannerImage: true,
        aboutHtml: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found or not available' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(`Failed to fetch event ${eventId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
