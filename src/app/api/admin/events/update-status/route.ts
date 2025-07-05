import { NextResponse } from 'next/server';
import { updateEventStatuses } from '@/lib/event-status';
import { prisma } from '@/lib/prisma';

/**
 * POST: Update event statuses based on current date/time
 * This can be called manually or by a cron job
 */
export async function POST() {
  try {
    const result = await updateEventStatuses();
    
    return NextResponse.json({
      success: true,
      message: 'Event statuses updated successfully',
      ...result
    });
  } catch (error) {
    console.error('Failed to update event statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update event statuses' 
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET: Get current event status update information
 */
export async function GET() {
  try {
    // Get events that need status updates
    const now = new Date();
    
    const needsUpdate = await prisma.event.findMany({
      where: {
        OR: [
          {
            status: 'UPCOMING',
            startDate: { lte: now },
            endDate: { gt: now }
          },
          {
            status: 'LIVE',
            endDate: { lte: now }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true
      }
    });

    return NextResponse.json({
      success: true,
      eventsNeedingUpdate: needsUpdate.length,
      events: needsUpdate
    });
  } catch (error) {
    console.error('Failed to check event statuses:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check event statuses' 
      }, 
      { status: 500 }
    );
  }
}
