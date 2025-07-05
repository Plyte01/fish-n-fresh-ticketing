// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secretKey = process.env.JWT_SECRET;
if (!secretKey) throw new Error('JWT_SECRET is not defined in environment variables.');

const key = new TextEncoder().encode(secretKey);

// Original structure used in the app
export interface AdminPayload {
  adminId: string;
  email: string;
  permissions: string[];
  expiresAt: Date;
}

// JSON-safe structure for storing in the JWT
interface AdminJWTPayload {
  adminId: string;
  email: string;
  permissions: string[];
  expiresAt: string; // ISO string format
}

/**
 * Encrypts the admin payload into a signed JWT token.
 */
export async function encrypt(payload: AdminPayload): Promise<string> {
  const jwtPayload: AdminJWTPayload = {
    adminId: payload.adminId,
    email: payload.email,
    permissions: payload.permissions,
    expiresAt: payload.expiresAt.toISOString(),
  };

  return await new SignJWT(jwtPayload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h') // Also controls token expiry
    .sign(key);
}

/**
 * Decrypts the token into an AdminPayload object.
 */
export async function decrypt(token: string): Promise<AdminPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      permissions: payload.permissions as string[],
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch (error) {
    console.error('JWT decryption failed:', error);
    return null;
  }
}

/**
 * Returns the current session (admin payload) from cookies.
 */
export async function getSession(): Promise<AdminPayload | null> {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  
  const payload = await decrypt(session);
  
  // Check if session has expired
  if (payload && payload.expiresAt < new Date()) {
    // Session expired, clear the cookie
    (await cookies()).delete('session');
    return null;
  }
  
  return payload;
}

/**
 * Refreshes the session cookie by re-signing it and extending expiration.
 */
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  if (!parsed) return;

  // Check if session is close to expiring (within 1 hour)
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const shouldRefresh = parsed.expiresAt < oneHourFromNow;

  if (shouldRefresh) {
    // Extend the session
    parsed.expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // +8 hours

    const res = NextResponse.next();
    res.cookies.set({
      name: 'session',
      value: await encrypt(parsed),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: parsed.expiresAt,
    });

    return res;
  }

  return NextResponse.next();
}

/**
 * Logs out the user by clearing the session cookie.
 */
export async function logout(): Promise<void> {
  (await cookies()).delete('session');
}
