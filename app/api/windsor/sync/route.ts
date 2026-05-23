import { createClient } from "@/lib/supabase/server";
import { queryWindsor } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/sync
 * Sync data from Windsor.ai for a specific platform
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform } = await request.json();

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    // Query Windsor.ai for the platform data
    const result = await queryWindsor({
      connector: platform === "all" ? "all" : platform,
      fields: [
        "date",
        "datasource",
        "account_name",
        "source",
        "clicks",
        "impressions",
        "spend",
        "reach",
        "campaign",
      ],
      date_preset: "last_28d",
    });

    return NextResponse.json({
      success: true,
      recordsSynced: result.data.length,
      platform,
      data: result.data,
    });
  } catch (error) {
    console.error("Windsor sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
