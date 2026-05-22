import { createClient } from "@/lib/supabase/server";
import { querySupermetrics, parseRows } from "@/lib/supermetrics/client";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DS_IDS = new Set([
  "FA",      // Facebook Ads
  "FBI",     // Facebook Insights
  "INSTA",   // Instagram Insights
  "TTADS",   // TikTok Ads
  "TIKTOK",  // TikTok Organic
  "GAWA",    // Google Ads
  "GA4",     // Google Analytics 4
]);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ds_id, ds_accounts, fields, date_range_type, start_date, end_date, filter, max_rows } = body;

    if (!ds_id || !fields) {
      return NextResponse.json(
        { error: "ds_id and fields are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_DS_IDS.has(ds_id)) {
      return NextResponse.json(
        { error: `Data source '${ds_id}' is not allowed` },
        { status: 400 }
      );
    }

    const query: Parameters<typeof querySupermetrics>[0] = {
      ds_id,
      ds_accounts: ds_accounts ?? "",
      fields,
      max_rows: max_rows ?? 1000,
      settings: { no_headers: false },
    };

    if (start_date && end_date) {
      query.start_date = start_date;
      query.end_date = end_date;
    } else if (date_range_type) {
      query.date_range_type = date_range_type;
    } else {
      query.date_range_type = "last_30_days";
    }

    if (filter) query.filter = filter;

    const result = await querySupermetrics(query);
    const rows = parseRows(result);

    return NextResponse.json({ rows, meta: result.meta });
  } catch (error) {
    console.error("Supermetrics query proxy error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed" },
      { status: 500 }
    );
  }
}
