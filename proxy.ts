import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/admin']
const AUTH_PAGES = ['/auth/login', '/auth/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('firebase-session')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage  = AUTH_PAGES.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
}
