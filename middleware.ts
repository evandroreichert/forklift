import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // /portal/* exige session
  if (pathname.startsWith('/portal') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // /login com session válida redireciona pra /portal
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/login',
  ],
};
