// src/app/api/admin/events/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for event creation validation
const createEventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  venue: z.string().min(3, 'Venue must be at least 3 characters'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  isFeatured: z.boolean().optional(),
  bannerImage: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  aboutHtml: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

/**
 * GET: Fetch all events
 * Requires VIEW_DASHBOARD or MANAGE_EVENTS permission
 */
export async function GET() {
  const session = await getSession();
  if (!session || !session.permissions.some(p => ['MANAGE_EVENTS', 'VIEW_DASHBOARD'].includes(p))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST: Create a new event
 * Requires MANAGE_EVENTS permission
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_EVENTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    console.log('Received event creation request:', body);
    
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { name, startDate, endDate, venue, isFeatured, price, bannerImage, aboutHtml } = validation.data;

    const newEvent = await prisma.event.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        venue,
        price,
        isFeatured: isFeatured ?? false,
        bannerImage: bannerImage || null,
        aboutHtml: aboutHtml || null,
        status: 'UPCOMING', // Default status
      },
    });

    console.log('Created event:', newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}