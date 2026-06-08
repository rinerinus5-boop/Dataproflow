import { createClient } from "@/lib/supabase/server";
import { generateAuthLink } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_SOURCES = new Set([
  "facebook", "instagram", "tiktok", "tiktok_ads",
  "google_ads", "google_analytics4", "linkedin",
  "twitter", "snapchat", "pinterest",
]);

/**
 * POST /api/windsor/init-auth
 * Initiates Windsor OAuth flow with proper session tracking
 * 1. Generates Windsor auth link with access_token
 * 2. Stores pending connection in DB
 * 3. Returns auth_url for popup
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

    // Generate Windsor auth link - returns { url, access_token }
    const authResult = await generateAuthLink(platform || undefined);

    if (!authResult.access_token) {
      return NextResponse.json({ 
        error: "Windsor did not return access_token. Auth link may be expired or reused." 
      }, { status: 500 });
    }

    // Store pending connection with 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    
    const { error: insertError } = await supabase
      .from("pending_connections")
      .insert({
        user_id: user.id,
        platform: platform || "unknown",
        windsor_access_token: authResult.access_token,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Failed to store pending connection:", insertError);
      return NextResponse.json({ error: "Failed to initiate connection" }, { status: 500 });
    }

    return NextResponse.json({
      auth_url: authResult.url,
      access_token: authResult.access_token,
      message: "Open this URL in a popup. After authorization, call /api/windsor/complete-auth with the access_token",
    });
  } catch (error) {
    console.error("Init auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate auth" },
      { status: 500 }
    );
  }
}
