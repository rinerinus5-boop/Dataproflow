import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTokensFromCode } from '@/lib/google-calendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com';
  
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=google_auth_failed&message=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/dashboard?error=no_code`);
  }

  try {
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      throw new Error('No access token received');
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=not_authenticated`);
    }

    // Store tokens in database
    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        scope: tokens.scope,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error storing tokens:', upsertError);
      throw upsertError;
    }

    // Redirect based on state (where user came from)
    const redirectPath = state ? decodeURIComponent(state) : '/dashboard';
    const redirectUrl = `${baseUrl}${redirectPath}?google_connected=true`;
    
    return NextResponse.redirect(redirectUrl);

  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=google_auth_failed`);
  }
}
