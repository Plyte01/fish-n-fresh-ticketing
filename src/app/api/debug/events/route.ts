// src/app/api/debug/events/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all events for debugging
    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        venue: true,
        price: true,
        createdAt: true,
        isFeatured: true,
      }
    });

    // Get public events (what should show on frontend)
    const publicEvents = await prisma.event.findMany({
      where: { 
        status: { in: ['UPCOMING', 'LIVE'] }, 
        startDate: { gte: new Date() } 
      },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        venue: true,
        price: true,
        createdAt: true,
        isFeatured: true,
      }
    });

    return NextResponse.json({
      totalEvents: allEvents.length,
      publicEvents: publicEvents.length,
      currentDate: new Date().toISOString(),
      allEvents,
      //publicEvents,
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Debug events error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch debug info', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}