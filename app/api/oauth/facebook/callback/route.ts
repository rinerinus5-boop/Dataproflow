import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  exchangeFacebookCode,
  getLongLivedToken,
  getFacebookUserInfo,
} from "@/lib/oauth/facebook";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=oauth_denied`
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=missing_params`
      );
    }

    // Parse state to get platform type
    let platform: "facebook" | "instagram" = "facebook";
    try {
      const stateData = JSON.parse(stateParam);
      platform = stateData.platform || "facebook";
    } catch {
      // Default to facebook if state parsing fails
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

    // Exchange code for access token
    const tokenData = await exchangeFacebookCode(code);

    // Get long-lived token (valid for ~60 days)
    const longLivedToken = await getLongLivedToken(tokenData.access_token);

    // Get basic user info (works with new Meta UI basic permissions)
    const userInfo = await getFacebookUserInfo(longLivedToken.access_token);

    const adminSupabase = createAdminClient();

    // For now, store the basic Facebook connection
    // Note: Instagram and Facebook Page access require additional permissions
    // that need App Review in the new Meta platform
    if (platform === "instagram") {
      // Instagram connection with basic permissions
      // In production, this would require instagram_basic permission from App Review
      const { error: insertError } = await adminSupabase
        .from("connected_accounts")
        .upsert(
          {
            user_id: user.id,
            platform: "instagram",
            platform_user_id: userInfo.id,
            platform_username: userInfo.name,
            access_token: longLivedToken.access_token,
            refresh_token: null,
            token_expires_at: new Date(
              Date.now() + longLivedToken.expires_in * 1000
            ).toISOString(),
            is_active: true,
          },
          {
            onConflict: "user_id,platform,platform_user_id",
          }
        );

      if (insertError) {
        console.error("Error saving Instagram connection:", insertError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=save_failed&msg=${encodeURIComponent(insertError.message)}`
        );
      }

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?success=instagram`
      );
    }

    // Facebook connection with basic permissions
    const { error: insertError } = await adminSupabase
      .from("connected_accounts")
      .upsert(
        {
          user_id: user.id,
          platform: "facebook",
          platform_user_id: userInfo.id,
          platform_username: userInfo.name,
          access_token: longLivedToken.access_token,
          refresh_token: null,
          token_expires_at: new Date(
            Date.now() + longLivedToken.expires_in * 1000
          ).toISOString(),
          is_active: true,
        },
        {
          onConflict: "user_id,platform,platform_user_id",
        }
      );

    if (insertError) {
      console.error("Error saving Facebook connection:", insertError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=save_failed&msg=${encodeURIComponent(insertError.message)}`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?success=facebook`
    );
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=callback_failed&details=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    );
  }
}

