// src/app/api/tickets/lookup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');
  const ticketCode = searchParams.get('ticketCode');

  // A search parameter must be provided
  if (!reference && !email && !phone && !ticketCode) {
    return NextResponse.json({ error: 'A search parameter (reference, email, phone, or ticketCode) is required.' }, { status: 400 });
  }

  try {
    // Case 1: Search by payment reference (for post-payment success page)
    if (reference) {
      const payment = await prisma.payment.findUnique({
        where: { reference },
        include: {
          ticket: { include: { event: true } },
        },
      });
      if (!payment || !payment.ticket) {
        return NextResponse.json({ error: 'Ticket not found for this transaction.' }, { status: 404 });
      }
      // Return a single ticket object
      return NextResponse.json(payment.ticket);
    }
    
    // Case 2: Search by ticket code
    if (ticketCode) {
      const ticket = await prisma.ticket.findUnique({
        where: { ticketCode },
        include: {
          event: {
            select: {
              name: true,
              startDate: true,
              endDate: true,
            }
          }
        },
      });
      
      if (!ticket) {
        return NextResponse.json({ error: 'No ticket found with this ticket code.' }, { status: 404 });
      }
      
      // Return as an array for consistency with the frontend
      return NextResponse.json([ticket]);
    }
    
    // Case 3: Search by email or phone (for public lookup page)
    const whereClause = email 
      ? { email: { equals: email, mode: 'insensitive' as const } } 
      : { phone: { equals: phone! } }; // We know one of them exists at this point
      
    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            name: true,
            startDate: true,
            endDate: true,
          }
        }
      },
      orderBy: { issuedAt: 'desc' },
    });

    if (tickets.length === 0) {
      return NextResponse.json({ error: 'No tickets were found with the provided details.' }, { status: 404 });
    }
    
    // Return an array of tickets
    return NextResponse.json(tickets);

  } catch (error) {
    console.error("Ticket lookup error:", error);
    return NextResponse.json({ error: 'An unexpected internal error occurred.' }, { status: 500 });
  }
}