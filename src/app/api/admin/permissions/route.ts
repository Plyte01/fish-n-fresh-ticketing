// src/app/api/admin/permissions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  // Any logged-in admin should be able to see the list of available permissions
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const permissions = await prisma.permission.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(permissions);
}