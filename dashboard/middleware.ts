import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });
  const { pathname } = request.nextUrl;

  // Auth routes (only for admin roles)
  const authRoutes = [
    '/',
    '/set-up',
    '/set-password',
  ];

  // Admin dashboard routes
  const adminDashboardRoutes = [
    '/superadmin-dashboard',
    '/admin-dashboard', 
    '/creator-dashboard',
  ];

  // All protected routes
  const allProtectedRoutes = [...adminDashboardRoutes];

  // ===== AUTH ROUTES PROTECTION =====
  if (authRoutes.includes(pathname)) {
    if (token) {
      const role = token.role as 'admin' | 'creator' | 'superAdmin';
      
      // Redirect to appropriate dashboard based on role
      if (role === 'superAdmin') {
        return NextResponse.redirect(new URL('/superadmin-dashboard', request.url));
      }
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin-dashboard', request.url));
      }
      if (role === 'creator') {
        return NextResponse.redirect(new URL('/creator-dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // ===== PROTECTED ROUTES =====
  if (allProtectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/', request.url));
    }

    const role = token.role as 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';

    // Redirect non-admin roles to home
    if (role === 'user' || role === 'agent') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Role-specific route protection
    if (pathname.startsWith('/superadmin-dashboard') && role !== 'superAdmin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
    }

    if (pathname.startsWith('/admin-dashboard') && role !== 'admin') {
      return NextResponse.redirect(new URL('/creator-dashboard', request.url));
    }

    if (pathname.startsWith('/creator-dashboard') && role !== 'creator') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url));
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