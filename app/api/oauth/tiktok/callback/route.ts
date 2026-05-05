import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/oauth/tiktok";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("TikTok OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=oauth_denied`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=missing_code`
      );
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get("tiktok_code_verifier")?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=missing_verifier`
      );
    }

    // Verify user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=unauthorized`
      );
    }

    // Exchange code for access token with PKCE verifier
    const tokenData = await exchangeTikTokCode(code, codeVerifier);

    // Get user info
    const userInfo = await getTikTokUserInfo(tokenData.access_token);

    const adminSupabase = createAdminClient();

    // Check if already connected
    const { data: existingAccount } = await adminSupabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", "tiktok")
      .eq("platform_user_id", tokenData.open_id)
      .single();

    if (existingAccount) {
      // Update existing connection
      await adminSupabase
        .from("connected_accounts")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          platform_username: userInfo.display_name,
          token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingAccount.id);
    } else {
      // Create new connection
      await adminSupabase.from("connected_accounts").insert({
        user_id: user.id,
        platform: "tiktok",
        platform_user_id: tokenData.open_id,
        platform_username: userInfo.display_name,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
        is_active: true,
      });
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?success=tiktok`
    );
  } catch (error) {
    console.error("TikTok callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=callback_failed`
    );
  }
}
