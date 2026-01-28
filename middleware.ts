import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Redirect unauthenticated users trying to access protected routes
  if (!session && request.nextUrl.pathname.startsWith('/dashboard') || 
      !session && request.nextUrl.pathname.startsWith('/manager')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users trying to access auth pages
  if (session && (request.nextUrl.pathname.startsWith('/login') || 
                 request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/manager/:path*', '/login', '/signup']
}