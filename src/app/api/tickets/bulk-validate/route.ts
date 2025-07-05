// src/app/api/tickets/bulk-validate/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const bulkValidationSchema = z.object({
  ticketCodes: z.array(z.string().min(1)).max(50, 'Maximum 50 tickets per batch')
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.permissions.includes('SCAN_TICKETS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = bulkValidationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.flatten() 
      }, { status: 400 });
    }

    const { ticketCodes } = validation.data;

    // Process tickets in transaction for consistency
    const processedResults = await prisma.$transaction(async (tx) => {
      const batchResults = [];

      for (const ticketCode of ticketCodes) {
        try {
          const ticket = await tx.ticket.findUnique({
            where: { ticketCode: ticketCode.trim().toUpperCase() },
            include: { event: true }
          });

          if (!ticket) {
            batchResults.push({
              ticketCode: ticketCode,
              status: 'INVALID',
              message: 'Ticket not found',
              success: false
            });
            continue;
          }

          if (ticket.checkedIn) {
            batchResults.push({
              ticketCode: ticketCode,
              status: 'ALREADY_CHECKED_IN',
              message: 'Ticket already used',
              success: false,
              ticket: ticket
            });
            continue;
          }

          // Check in the ticket
          const updatedTicket = await tx.ticket.update({
            where: { id: ticket.id },
            data: { checkedIn: true },
            include: { event: true }
          });

          // Log the check-in
          await tx.checkinLog.create({
            data: { 
              status: 'SUCCESS', 
              ticketId: ticket.id, 
              adminId: session.adminId,
              notes: 'Bulk validation'
            }
          });

          batchResults.push({
            ticketCode: ticketCode,
            status: 'SUCCESS',
            message: 'Check-in successful',
            success: true,
            ticket: updatedTicket
          });

        } catch {
          batchResults.push({
            ticketCode: ticketCode,
            status: 'ERROR',
            message: 'Processing error',
            success: false
          });
        }
      }

      return batchResults;
    });

    // Calculate summary
    const summary = {
      total: ticketCodes.length,
      successful: processedResults.filter(r => r.success).length,
      failed: processedResults.filter(r => !r.success).length,
      alreadyUsed: processedResults.filter(r => r.status === 'ALREADY_CHECKED_IN').length,
      invalid: processedResults.filter(r => r.status === 'INVALID').length
    };

    return NextResponse.json({
      summary,
      results: processedResults
    });

  } catch (error) {
    console.error('Bulk validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
