import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret });
  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    '/user-dashboard',
    '/agent-dashboard',
    '/admin-dashboard',
  ];

  const authRoutes = [
    '/sign-up',
    '/log-in',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ];

  if (authRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const role = token.role as 'user' | 'agent' | 'admin' | 'creator' | 'superAdmin';

    const adminRoles = ['superAdmin', 'admin', 'creator'];

    if (pathname.startsWith('/admin-dashboard')) {
      
      if (!adminRoles.includes(role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      return NextResponse.next();
    }

    if (
      (pathname.startsWith('/user-dashboard') && role !== 'user') ||
      (pathname.startsWith('/agent-dashboard') && role !== 'agent')
    ) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user-dashboard/:path*',
    '/agent-dashboard/:path*',
    '/admin-dashboard/:path*',
    '/sign-up',
    '/log-in',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ],
};