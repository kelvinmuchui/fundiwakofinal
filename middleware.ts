import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Fundi routes protection
    if (path.startsWith('/fundi/profile') && token?.role !== 'fundi') {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    // Dashboard (General protected route)
    if (path.startsWith('/dashboard') && !token) {
      return NextResponse.redirect(new URL('/auth', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth',
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/fundi/profile/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
  ],
};
