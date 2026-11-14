import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const isLocalDemo = process.env.NODE_ENV !== 'production' && searchParams.get('demo') === 'true';
  if (isLocalDemo) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const requiresAdmin = pathname.startsWith('/admin');
  const requiresDriver = pathname.startsWith('/driver');
  const isAuthorized = token && (
    (requiresAdmin && token.role === 'ADMIN')
    || (requiresDriver && (token.role === 'DRIVER' || token.role === 'ADMIN'))
    || (!requiresAdmin && !requiresDriver)
  );

  if (isAuthorized) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('callbackUrl', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/book/:path*', '/payment/:path*', '/ticket/:path*', '/admin/:path*', '/driver/:path*'],
};