import { createClient } from "@/lib/supabase/server";
import { getTikTokAuthUrl, generatePKCE } from "@/lib/oauth/tiktok";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/login?error=unauthorized`
      );
    }

    // Check subscription limits
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    const { data: connectedAccounts } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const hasActiveSubscription =
      subscription?.status === "active" || subscription?.status === "trialing";

    if (!hasActiveSubscription) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=no_subscription`
      );
    }

    // Check connection limits
    const maxConnections =
      subscription?.plan === "enterprise"
        ? Infinity
        : subscription?.plan === "professional"
        ? 5
        : 1;

    if ((connectedAccounts?.length || 0) >= maxConnections) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=limit_reached`
      );
    }

    // Generate state for CSRF protection
    const state = crypto.randomUUID();

    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Store state and code verifier in cookies for verification
    const response = NextResponse.redirect(getTikTokAuthUrl(state, codeChallenge));

    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    response.cookies.set("tiktok_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("TikTok connect error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/connections?error=connection_failed`
    );
  }
}
