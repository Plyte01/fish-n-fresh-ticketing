// src/app/api/tickets/validate/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({ ticketCode: z.string().min(1, 'Ticket code cannot be empty') });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.permissions.includes('SCAN_TICKETS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { ticketCode } = validation.data;
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json({ status: 'INVALID', message: 'Ticket not found.' }, { status: 404 });
    }

    if (ticket.checkedIn) {
      return NextResponse.json({ status: 'ALREADY_CHECKED_IN', message: 'This ticket has already been used.', ticket }, { status: 409 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { checkedIn: true },
      include: { event: true },
    });

    await prisma.checkinLog.create({
      data: { status: 'SUCCESS', ticketId: ticket.id, adminId: session.adminId },
    });

    return NextResponse.json({ status: 'SUCCESS', message: 'Check-in successful!', ticket: updatedTicket }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}