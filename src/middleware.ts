import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      const expectedPassword = process.env.ADMIN_PASSWORD || 'losa-admin-2026';

      // Accept any username as long as the password is correct, 
      // but commonly the browser prompts for both so we expect user to type "admin"
      if (user === 'admin' && pwd === expectedPassword) {
        return NextResponse.next();
      }
    }

    // Return 401 to trigger the browser's native login popup
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
