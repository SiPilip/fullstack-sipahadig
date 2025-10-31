import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('sipahadig-token');
  const { pathname } = request.nextUrl;

  // New rule: Redirect root path to /login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let isLoggedIn = false;

  if (tokenCookie) {
    try {
      await jwtVerify(tokenCookie.value, secret);
      isLoggedIn = true;
    } catch (err) {
      isLoggedIn = false;
    }
  }

  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'], // Add root path to the matcher
};
