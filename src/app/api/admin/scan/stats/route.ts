// src/app/api/admin/scan/stats/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || !session.permissions.includes('SCAN_TICKETS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Get scanning statistics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get check-in logs for today
    const todaysLogs = await prisma.checkinLog.findMany({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        ticket: {
          include: {
            event: true
          }
        },
        admin: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Last 50 scans
    });

    // Calculate statistics
    const successfulScans = todaysLogs.filter(log => log.status === 'SUCCESS').length;
    const totalTickets = await prisma.ticket.count({
      where: {
        event: {
          startDate: {
            gte: today,
            lt: tomorrow
          }
        }
      }
    });

    // Get unique events scanned today
    const eventsScannedToday = await prisma.event.findMany({
      where: {
        tickets: {
          some: {
            checkinLogs: {
              some: {
                timestamp: {
                  gte: today,
                  lt: tomorrow
                }
              }
            }
          }
        }
      },
      include: {
        tickets: {
          where: {
            checkedIn: true
          }
        }
      }
    });

    // Get hourly breakdown for today
    const hourlyStats = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(today);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(hour + 1, 0, 0, 0);

      const scansInHour = todaysLogs.filter(log => 
        log.timestamp >= hourStart && log.timestamp < hourEnd && log.status === 'SUCCESS'
      ).length;

      hourlyStats.push({
        hour,
        scans: scansInHour,
        label: `${hour.toString().padStart(2, '0')}:00`
      });
    }

    return NextResponse.json({
      today: {
        totalScans: todaysLogs.length,
        successfulScans,
        duplicateAttempts: todaysLogs.filter(log => log.status === 'ALREADY_CHECKED_IN').length,
        invalidTickets: todaysLogs.filter(log => log.status === 'INVALID_TICKET').length,
        attendanceRate: totalTickets > 0 ? Math.round((successfulScans / totalTickets) * 100) : 0
      },
      recentActivity: todaysLogs.slice(0, 10).map(log => ({
        id: log.id,
        status: log.status,
        timestamp: log.timestamp,
        ticketCode: log.ticket?.ticketCode,
        eventName: log.ticket?.event?.name,
        adminName: log.admin.fullName,
        notes: log.notes
      })),
      eventsToday: eventsScannedToday.map(event => ({
        id: event.id,
        name: event.name,
        venue: event.venue,
        totalTickets: event.tickets.length,
        checkedInCount: event.tickets.filter(t => t.checkedIn).length,
        startDate: event.startDate
      })),
      hourlyBreakdown: hourlyStats
    });
  } catch (error) {
    console.error('Failed to fetch scan stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
