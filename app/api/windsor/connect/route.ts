import { createClient } from "@/lib/supabase/server";
import { generateAuthLink } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_SOURCES = new Set([
  "facebook", "instagram", "tiktok", "tiktok_ads",
  "google_ads", "google_analytics4", "linkedin",
  "twitter", "snapchat", "pinterest",
]);

/**
 * GET /api/windsor/connect?source=facebook
 * Returns a Windsor.ai co-user authorization URL for the given source.
 * The user is redirected to this URL to connect their account.
 * After connecting, Windsor stores the account under the DataProFlow API key.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = request.nextUrl.searchParams.get("source") ?? "";

    if (source && !ALLOWED_SOURCES.has(source)) {
      return NextResponse.json({ error: `Unsupported source: ${source}` }, { status: 400 });
    }

    const result = await generateAuthLink(source || undefined);

    // If caller wants a redirect, do it directly
    const redirect = request.nextUrl.searchParams.get("redirect") === "1";
    if (redirect && result?.url) {
      return NextResponse.redirect(result.url);
    }

    return NextResponse.json({ auth_url: result?.url ?? result });
  } catch (error) {
    console.error("Windsor connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate auth link" },
      { status: 500 }
    );
  }
}
