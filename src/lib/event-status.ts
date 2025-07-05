import { prisma } from '@/lib/prisma';

/**
 * Updates event statuses based on current date and time
 * UPCOMING -> LIVE -> ENDED
 */
export async function updateEventStatuses() {
  const now = new Date();

  try {
    // Update UPCOMING events to LIVE if they have started
    const upcomingToLive = await prisma.event.updateMany({
      where: {
        status: 'UPCOMING',
        startDate: {
          lte: now
        },
        endDate: {
          gt: now
        }
      },
      data: {
        status: 'LIVE'
      }
    });

    // Update LIVE events to ENDED if they have finished
    const liveToEnded = await prisma.event.updateMany({
      where: {
        status: 'LIVE',
        endDate: {
          lte: now
        }
      },
      data: {
        status: 'ENDED'
      }
    });

    console.log(`Event status update: ${upcomingToLive.count} events moved to LIVE, ${liveToEnded.count} events moved to ENDED`);

    return {
      upcomingToLive: upcomingToLive.count,
      liveToEnded: liveToEnded.count
    };
  } catch (error) {
    console.error('Error updating event statuses:', error);
    throw error;
  }
}

/**
 * Gets the current status that an event should have based on its dates
 */
export function getExpectedEventStatus(startDate: Date, endDate: Date): 'UPCOMING' | 'LIVE' | 'ENDED' {
  const now = new Date();
  
  if (now < startDate) {
    return 'UPCOMING';
  } else if (now >= startDate && now <= endDate) {
    return 'LIVE';
  } else {
    return 'ENDED';
  }
}
