// src/app/api/admin/admins/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const createAdminSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  permissionIds: z.array(z.string()).min(1, 'At least one permission is required'),
});

// GET: Fetch all admins
export async function GET() {
  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_ADMINS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      permissions: { include: { permission: true } },
    },
  });
  // Exclude password hashes from the response
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const adminsWithoutPasswords = admins.map(({ password, ...admin }) => admin);
  return NextResponse.json(adminsWithoutPasswords);
}

// POST: Create a new admin
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.permissions.includes('MANAGE_ADMINS')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = createAdminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }
    const { fullName, email, password, permissionIds } = validation.data;

    const hashedPassword = await hash(password, 12);

    const newAdmin = await prisma.admin.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        permissions: {
          create: permissionIds.map(id => ({ permissionId: id })),
        },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...adminData } = newAdmin;
    return NextResponse.json(adminData, { status: 201 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint violation (email)
        return NextResponse.json({ error: { fieldErrors: { email: ['Email already in use.'] } } }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}