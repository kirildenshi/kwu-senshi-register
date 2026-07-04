import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const UNAUTHORIZED = new NextResponse('Authentication required', {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Uploads", charset="UTF-8"' },
});

// Uploaded registration documents (rank certificates, ID photos, etc.) live
// under public/uploads and are otherwise served as plain static files by
// Next.js — anyone with the URL could view them. Gate that one path with a
// single shared credential since the app has no user auth/session system to
// hook into otherwise.
function isAuthorizedForUploads(request: NextRequest): boolean {
  const user = process.env.UPLOADS_AUTH_USER;
  const pass = process.env.UPLOADS_AUTH_PASSWORD;
  if (!user || !pass) return false;

  const header = request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return false;

  const decoded = atob(header.slice('Basic '.length));
  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  const gotUser = decoded.slice(0, separatorIndex);
  const gotPass = decoded.slice(separatorIndex + 1);
  return gotUser === user && gotPass === pass;
}

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    return isAuthorizedForUploads(request) ? NextResponse.next() : UNAUTHORIZED;
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/uploads/:path*'],
};
