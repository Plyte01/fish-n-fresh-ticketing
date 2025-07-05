// src/app/api/admin/payments/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // ✅ Needed for QueryMode

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || !session.permissions.includes('VIEW_PAYMENTS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const searchQuery = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  try {
    const whereClause = searchQuery
      ? {
          OR: [
            {
              email: {
                contains: searchQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              reference: {
                contains: searchQuery,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              event: {
                name: {
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }
      : {};

    const [payments, totalPayments] = await prisma.$transaction([
      prisma.payment.findMany({
        skip,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: { name: true },
          },
        },
      }),
      prisma.payment.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalPayments / limit);

    return NextResponse.json({
      payments,
      pagination: {
        total: totalPayments,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
