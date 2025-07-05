// src/app/api/admin/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

/**
 * GET: Fetch all stats for the admin dashboard
 * Requires VIEW_DASHBOARD permission
 */
export async function GET() {
  const session = await getSession();
  if (!session || !session.permissions.includes('VIEW_DASHBOARD')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // 1. Key Metrics
    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    });

    const totalTicketsSold = await prisma.ticket.count();
    const totalEvents = await prisma.event.count();

    // 2. Sales data for the last 7 days
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: subDays(new Date(), 7) },
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Group sales by day for the chart
    const salesByDay = recentPayments.reduce((acc, payment) => {
      const day = payment.createdAt.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + payment.amount;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(salesByDay).map(([name, total]) => ({ name, total }));

    // 3. Recent Sales (last 5 transactions)
    const recentSales = await prisma.payment.findMany({
      where: { status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { event: { select: { name: true } } },
    });

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTicketsSold,
      totalEvents,
      chartData,
      recentSales,
    });
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}