// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { decrypt, updateSession } from '@/lib/auth';

// Define the routes that are part of the admin panel but are publicly accessible.
const publicAdminRoutes = ['/admin/login'];

/**
 * Middleware to protect admin routes.
 *
 * This function runs on every request to a path matching the config's matcher.
 * It checks for a valid session cookie and redirects users based on their
 * authentication status and the route they are trying to access.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // Attempt to decrypt the session cookie to verify authentication.
  // `session` will be the payload if valid, otherwise null.
  const session = sessionCookie ? await decrypt(sessionCookie) : null;

  // Determine if the requested path is a protected admin route.
  // A route is protected if it starts with '/admin/' AND is not in the public list.
  const isProtectedRoute = pathname.startsWith('/admin/') && !publicAdminRoutes.includes(pathname);

  // --- Redirect Logic ---

  // Case 1: User is trying to access a protected route.
  if (isProtectedRoute) {
    // If they don't have a valid session, redirect them to the login page.
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Case 2: User is trying to access a public admin route (e.g., /admin/login).
  if (publicAdminRoutes.includes(pathname)) {
    // If they *do* have a valid session, they shouldn't see the login page again.
    // Redirect them to the main dashboard.
    if (session) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Auto-update event statuses in the background
  autoUpdateEventStatuses();

  // If none of the above conditions are met, allow the request to proceed.
  return updateSession(request);
}

// Auto-update event statuses every 5 minutes
let lastStatusUpdate = 0;
const STATUS_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function autoUpdateEventStatuses() {
  const now = Date.now();

  // Only update if enough time has passed
  if (now - lastStatusUpdate < STATUS_UPDATE_INTERVAL) {
    return;
  }

  try {
    // Call the status update API
    await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/events/update-status`,
      {
        method: 'POST',
      }
    );
    lastStatusUpdate = now;
  } catch (error) {
    console.error('Failed to auto-update event statuses:', error);
  }
}

// Configure the middleware to only run on routes within the /admin path.
export const config = {
  matcher: '/admin/:path*',
};