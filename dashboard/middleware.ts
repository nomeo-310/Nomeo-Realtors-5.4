import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Define role-based redirect paths
const roleRedirects: Record<string, string> = {
  superAdmin: '/superadmin-dashboard',
  admin: '/admin-dashboard',
  creator: '/creator-dashboard',
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/') {
    const callbackUrl = searchParams.get('callbackUrl');
    
    // If there's a callbackUrl but no token (user logged out)
    if (callbackUrl && !token) {
      // Create a new URL without the callbackUrl
      const newUrl = new URL(request.url);
      newUrl.searchParams.delete('callbackUrl');
      return NextResponse.redirect(newUrl);
    }
  }

  // Auth routes (only for admin roles)
  const authRoutes = ['/', '/set-up', '/set-password'];

  // All protected routes
  const allProtectedRoutes = [
    '/superadmin-dashboard',
    '/admin-dashboard',
    '/creator-dashboard',
  ];

  // ===== AUTH ROUTES PROTECTION =====
  if (authRoutes.includes(pathname)) {
    if (token) {
      const role = token.role as keyof typeof roleRedirects;
      
      // Only redirect logged-in admins away from auth pages
      if (roleRedirects[role]) {
        const redirectUrl = new URL(roleRedirects[role], request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }
    return NextResponse.next();
  }

  // ===== PROTECTED ROUTES =====
  // Check if current path starts with any protected route
  const isProtectedRoute = allProtectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as keyof typeof roleRedirects;

    // Deny access to non-admin roles
    if (role === 'user' || role === 'agent') {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('error', 'Access denied');
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific route protection
    const currentDashboard = allProtectedRoutes.find(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (currentDashboard) {
      const allowedRole = Object.entries(roleRedirects).find(
        ([, route]) => route === currentDashboard
      )?.[0];

      // If user doesn't have the correct role for this dashboard
      if (allowedRole && role !== allowedRole) {
        // Redirect to their appropriate dashboard
        const correctDashboard = roleRedirects[role];
        if (correctDashboard) {
          return NextResponse.redirect(new URL(correctDashboard, request.url));
        }
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin dashboards
    '/superadmin-dashboard/:path*',
    '/admin-dashboard/:path*',
    '/creator-dashboard/:path*',
    
    // Auth routes
    '/', 
    '/set-up',
    '/set-password',
  ],
};