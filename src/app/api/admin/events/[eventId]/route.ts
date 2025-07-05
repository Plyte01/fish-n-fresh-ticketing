// src/app/api/admin/events/[eventId]/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateEventSchema = z.object({
  name: z.string().min(3).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venue: z.string().min(3).optional(),
  price: z.coerce.number().min(0).optional(),
  status: z.enum(['UPCOMING', 'LIVE', 'ENDED', 'CANCELLED', 'DRAFT']).optional(),
  isFeatured: z.boolean().optional(),
  bannerImage: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
  aboutHtml: z.string().optional(),
});

type ParamsPromise = Promise<{ eventId: string }>;

/**
 * PATCH: Update an existing event
 * Requires MANAGE_EVENTS permission
 */
export async function PATCH(
  request: Request,
  { params }: { params: ParamsPromise }
) {
  const { eventId } = await params;

  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_EVENTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...validation.data,
        ...(validation.data.startDate && { startDate: new Date(validation.data.startDate) }),
        ...(validation.data.endDate && { endDate: new Date(validation.data.endDate) }),
        ...(validation.data.bannerImage !== undefined && { bannerImage: validation.data.bannerImage || null }),
        ...(validation.data.aboutHtml !== undefined && { aboutHtml: validation.data.aboutHtml || null }),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(`Failed to update event ${eventId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE: Delete an event
 * Requires MANAGE_EVENTS permission
 */
export async function DELETE(
  _request: Request,
  { params }: { params: ParamsPromise }
) {
  const { eventId } = await params;

  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_EVENTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.event.delete({
      where: { id: eventId },
    });

    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete event ${eventId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
