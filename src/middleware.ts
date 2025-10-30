import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Using jose for Edge-compatible JWT verification

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-secret-key');

export async function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('sipahadig-token');
  const { pathname } = request.nextUrl;

  let isLoggedIn = false;

  if (tokenCookie) {
    try {
      await jwtVerify(tokenCookie.value, secret);
      isLoggedIn = true;
    } catch (err) {
      // Token is invalid
      isLoggedIn = false;
    }
  }

  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && pathname.startsWith('/login')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};