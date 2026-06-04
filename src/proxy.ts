import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Admin route protection (from old proxy.ts)
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    const session = request.cookies.get('losa_admin_session');
    
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 2. Firebase Dashboard Protection
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/auth/complete-profile')) {
    const firebaseUid = request.cookies.get('firebase_uid');
    
    if (!firebaseUid || !firebaseUid.value) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
