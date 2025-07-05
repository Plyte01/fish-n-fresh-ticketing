import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET: Fetch all tickets for a specific event.
 * Requires MANAGE_TICKETS permission.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_TICKETS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      orderBy: { issuedAt: 'desc' }, // Show newest tickets first
    });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error(`Failed to fetch tickets for event ${eventId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
