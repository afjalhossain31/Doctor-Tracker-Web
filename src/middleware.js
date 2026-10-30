import { NextResponse } from 'next/server';

// First line of defence: redirect visitors without a session cookie.
// Real authorization is enforced by the API (JWT on every request).
export function middleware(req) {
  const hasSession = req.cookies.get('dt_token');
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/login')) {
    return hasSession ? NextResponse.redirect(new URL('/dashboard', req.url)) : NextResponse.next();
  }
  return hasSession ? NextResponse.next() : NextResponse.redirect(new URL('/login', req.url));
}

export const config = { matcher: ['/dashboard/:path*', '/doctors/:path*', '/patients/:path*', '/login'] };
