import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth(req => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public paths
  const publicPaths = ['/login', '/api/auth'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Match all paths except static files and _next
  matcher: ['/((?!_next/static|_next/image|favicon.ico|helm-logo.svg|guiding-principles.png|helm-ceo-readout.pdf).*)'],
};
