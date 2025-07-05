// src/app/api/admin/current/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET: Get current admin session info
 * Returns basic session information for the logged-in admin
 */
export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    adminId: session.adminId,
    email: session.email,
    permissions: session.permissions,
  });
}
