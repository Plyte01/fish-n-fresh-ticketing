// src/app/api/admin/events/[eventId]/checkin-list/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type ParamsPromise = Promise<{ eventId: string }>;

export async function GET(
  request: Request,
  { params }: { params: ParamsPromise }
) {
  const { eventId } = await params;

  const session = await getSession();
  if (!session || !session.permissions.includes('ACCESS_CHECKIN_LISTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: {
          orderBy: {
            email: 'asc',
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to fetch check-in list data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
