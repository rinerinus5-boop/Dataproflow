import { createClient } from "@/lib/supabase/server";
import { queryWindsor } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CONNECTORS = new Set([
  "facebook", "instagram", "tiktok", "tiktok_ads",
  "google_ads", "google_analytics4", "linkedin",
  "twitter", "snapchat", "pinterest", "all",
]);

/**
 * POST /api/windsor/query
 * Generic secure proxy — lets the frontend query any allowed connector
 * without exposing the Windsor API key.
 *
 * Body: { connector, fields, date_preset?, date_from?, date_to?, account_id?, access_token?, filter_string? }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      connector,
      fields,
      date_preset,
      date_from,
      date_to,
      account_id,
      access_token,
      filter_string,
    } = body;

    if (!connector || !fields?.length) {
      return NextResponse.json(
        { error: "connector and fields are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CONNECTORS.has(connector)) {
      return NextResponse.json(
        { error: `Connector '${connector}' is not allowed` },
        { status: 400 }
      );
    }

    const result = await queryWindsor({
      connector,
      fields: Array.isArray(fields) ? fields : [fields],
      ...(date_from && date_to
        ? { date_from, date_to }
        : { date_preset: date_preset ?? "last_30d" }),
      ...(account_id && { account_id }),
      ...(access_token && { access_token }),
      ...(filter_string && { filter_string }),
    });

    return NextResponse.json({ rows: result.data, meta: result.meta });
  } catch (error) {
    console.error("Windsor query proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}
