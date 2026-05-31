import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Protect all /admin routes except the login page itself
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('losa_admin_session');
    
    if (!session || session.value !== 'authenticated') {
      // Redirect to the custom login page
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
