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
    const dateRange = searchParams.get("date_range") ?? "last_30_days";
    const startDate = searchParams.get("start_date") ?? "";
    const endDate = searchParams.get("end_date") ?? "";

    const query: Parameters<typeof querySupermetrics>[0] = {
      ds_id: DS_IDS.INSTAGRAM_INSIGHTS,
      ds_accounts: account,
      fields: [
        "Date",
        "Impressions",
        "Reach",
        "ProfileViews",
        "FollowerCount",
        "FollowersGained",
        "FollowersLost",
        "Likes",
        "Comments",
        "Shares",
        "Saves",
        "EngagementRate",
      ],
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

    const totals = rows.reduce(
      (acc, row) => ({
        impressions: acc.impressions + (parseFloat(row.Impressions) || 0),
        reach: acc.reach + (parseFloat(row.Reach) || 0),
        likes: acc.likes + (parseFloat(row.Likes) || 0),
        comments: acc.comments + (parseFloat(row.Comments) || 0),
        shares: acc.shares + (parseFloat(row.Shares) || 0),
        saves: acc.saves + (parseFloat(row.Saves) || 0),
        followersGained: acc.followersGained + (parseFloat(row.FollowersGained) || 0),
      }),
      { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }
    );

    const latestFollowers = rows.length > 0
      ? parseFloat(rows[rows.length - 1].FollowerCount) || 0
      : 0;

    const avgEngagementRate =
      rows.length > 0
        ? (rows.reduce((sum, r) => sum + (parseFloat(r.EngagementRate) || 0), 0) / rows.length).toFixed(2)
        : "0.00";

    return NextResponse.json({
      platform: "instagram",
      account,
      dateRange,
      rows,
      totals: {
        ...totals,
        followers: latestFollowers,
        engagementRate: parseFloat(avgEngagementRate),
      },
    });
  } catch (error) {
    console.error("Supermetrics Instagram error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
