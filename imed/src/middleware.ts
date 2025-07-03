import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Log the requested path for debugging
  console.log(`Middleware processing: ${request.nextUrl.pathname}`);
  
  // During development, allow all auth routes to pass through
  if (request.nextUrl.pathname.startsWith('/auth') || 
      request.nextUrl.pathname.startsWith('/api/auth')) {
    console.log('Auth route detected, allowing access');
    return NextResponse.next();
  }
  
  // Get the token from the session
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAdmin = token?.role === 'admin';
  const isLoggedIn = !!token;
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!isAdmin && process.env.NODE_ENV === 'production') {
      console.log('Admin access denied, redirecting to signin');
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  // For API customization routes, require admin
  if (request.nextUrl.pathname.includes('/api/customization')) {
    if (!isAdmin) {
      console.log('API customization access denied');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 