import { createClient } from "@/lib/supabase/server";
import { generateAuthLink } from "@/lib/windsor/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_SOURCES = new Set([
  "facebook_organic", "instagram", "tiktok_organic", "tiktok_ads",
  "google_ads", "google_analytics4", "linkedin",
  "twitter", "snapchat", "pinterest",
]);

/**
 * POST /api/windsor/init-auth
 * Initiates Windsor OAuth flow with session tracking
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await request.json();

    if (platform && !ALLOWED_SOURCES.has(platform)) {
      return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 });
    }

    // Generate Windsor auth link
    const authResult = await generateAuthLink(platform || undefined);

    if (!authResult.url) {
      return NextResponse.json({ error: "Failed to get authorization URL" }, { status: 500 });
    }

    // Generate our own session token
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from("pending_connections")
      .insert({
        user_id: user.id,
        platform: platform || "unknown",
        windsor_access_token: sessionToken,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Failed to store pending connection:", insertError);
      return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
    }

    return NextResponse.json({
      auth_url: authResult.url,
      session_token: sessionToken,
    });
  } catch (error) {
    console.error("Init auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate auth" },
      { status: 500 }
    );
  }
}
