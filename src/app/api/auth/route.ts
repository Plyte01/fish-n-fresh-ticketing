// src/app/api/auth/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { encrypt, AdminPayload } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.flatten() 
      }, { status: 400 });
    }
    
    const { email, password } = validation.data;

    // 1. Find the admin and their permissions
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Compare password with the hash
    const passwordsMatch = await compare(password, admin.password);
    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Create the session payload
    const permissionsList = admin.permissions.map(p => p.permission.name);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    const sessionPayload: AdminPayload = {
      adminId: admin.id,
      email: admin.email,
      permissions: permissionsList,
      expiresAt: expiresAt,
    };
    
    // 4. Encrypt the session
    const session = await encrypt(sessionPayload);

    // 5. Save the session in a secure, HTTP-only cookie
    (await
          // 5. Save the session in a secure, HTTP-only cookie
          cookies()).set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: expiresAt,
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}