import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? await decrypt(token) : null;



  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/questions') || pathname.startsWith('/sessions') || pathname.startsWith('/results')) {
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect from login if already authenticated
  if (pathname === '/login') {
    if (payload) {
      if (payload.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/exam', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/exam/:path*', '/result/:path*', '/admin/:path*', '/dashboard/:path*', '/questions/:path*', '/sessions/:path*', '/results/:path*', '/login'],
};
