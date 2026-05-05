import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  try {
    // Generate Google OAuth URL with state parameter for redirect
    const authUrl = getAuthUrl(encodeURIComponent(redirectTo));
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=google_auth_init_failed', request.url)
    );
  }
}
