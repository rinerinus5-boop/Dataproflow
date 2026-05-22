import { createClient } from "@/lib/supabase/server";
import { querySupermetrics, parseRows, DS_IDS } from "@/lib/supermetrics/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const account = searchParams.get("account") ?? "";
    const type = searchParams.get("type") ?? "organic"; // "organic" | "ads"
    const dateRange = searchParams.get("date_range") ?? "last_30_days";
    const startDate = searchParams.get("start_date") ?? "";
    const endDate = searchParams.get("end_date") ?? "";

    const dsId = type === "ads" ? DS_IDS.TIKTOK_ADS : DS_IDS.TIKTOK_ORGANIC;

    const organicFields = [
      "Date",
      "VideoViews",
      "Likes",
      "Comments",
      "Shares",
      "Followers",
      "FollowersNet",
      "ProfileViews",
      "Reach",
      "Impressions",
    ];

    const adsFields = [
      "Date",
      "Impressions",
      "Clicks",
      "Spend",
      "VideoViews",
      "CTR",
      "CPM",
      "CPC",
      "Conversions",
      "CostPerConversion",
      "ROAS",
    ];

    const query: Parameters<typeof querySupermetrics>[0] = {
      ds_id: dsId,
      ds_accounts: account,
      fields: type === "ads" ? adsFields : organicFields,
      order_rows: "Date desc",
      max_rows: 1000,
      settings: { no_headers: false },
    };

    if (startDate && endDate) {
      query.start_date = startDate;
      query.end_date = endDate;
    } else {
      query.date_range_type = dateRange as never;
    }

    const result = await querySupermetrics(query);
    const rows = parseRows(result);

    let totals: Record<string, number> = {};

    if (type === "ads") {
      totals = rows.reduce(
        (acc, row) => ({
          impressions: acc.impressions + (parseFloat(row.Impressions) || 0),
          clicks: acc.clicks + (parseFloat(row.Clicks) || 0),
          spend: acc.spend + (parseFloat(row.Spend) || 0),
          videoViews: acc.videoViews + (parseFloat(row.VideoViews) || 0),
          conversions: acc.conversions + (parseFloat(row.Conversions) || 0),
        }),
        { impressions: 0, clicks: 0, spend: 0, videoViews: 0, conversions: 0 }
      );
    } else {
      totals = rows.reduce(
        (acc, row) => ({
          videoViews: acc.videoViews + (parseFloat(row.VideoViews) || 0),
          likes: acc.likes + (parseFloat(row.Likes) || 0),
          comments: acc.comments + (parseFloat(row.Comments) || 0),
          shares: acc.shares + (parseFloat(row.Shares) || 0),
          followersNet: acc.followersNet + (parseFloat(row.FollowersNet) || 0),
          reach: acc.reach + (parseFloat(row.Reach) || 0),
        }),
        { videoViews: 0, likes: 0, comments: 0, shares: 0, followersNet: 0, reach: 0 }
      );

      const latestFollowers = rows.length > 0
        ? parseFloat(rows[rows.length - 1].Followers) || 0
        : 0;
      totals.followers = latestFollowers;
    }

    return NextResponse.json({
      platform: "tiktok",
      type,
      account,
      dateRange,
      rows,
      totals,
    });
  } catch (error) {
    console.error("Supermetrics TikTok error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch TikTok data" },
      { status: 500 }
    );
  }
}
