// src/app/api/admin/admins/[adminId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const updateAdminSchema = z.object({
  fullName: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal('')),
  permissionIds: z.array(z.string()).min(1),
});

type ParamsPromise = Promise<{ adminId: string }>;

// --- PATCH Admin ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: ParamsPromise }
) {
  const { adminId } = await params;
  const session = await getSession();

  if (!session?.permissions.includes('MANAGE_ADMINS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = updateAdminSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { fullName, email, password, permissionIds } = validation.data;

    const updateData: { fullName?: string; email?: string; password?: string } = {
      ...(fullName && { fullName }),
      ...(email && { email }),
    };

    if (password?.trim()) {
      updateData.password = await hash(password, 12);
    }

    await prisma.$transaction([
      prisma.admin.update({
        where: { id: adminId },
        data: updateData,
      }),
      prisma.adminPermission.deleteMany({
        where: { adminId },
      }),
      prisma.adminPermission.createMany({
        data: permissionIds.map((id) => ({
          adminId,
          permissionId: id,
        })),
      }),
    ]);

    return NextResponse.json({ message: 'Admin updated successfully.' });
  } catch (error) {
    console.error('PATCH admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE Admin ---
export async function DELETE(
  _request: NextRequest,
  { params }: { params: ParamsPromise }
) {
  const { adminId } = await params;
  const session = await getSession();

  if (!session?.permissions.includes('MANAGE_ADMINS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.adminId === adminId) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    await prisma.admin.delete({
      where: { id: adminId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE admin error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
