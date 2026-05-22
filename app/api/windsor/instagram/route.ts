import { createClient } from "@/lib/supabase/server";
import { queryWindsor, CONNECTORS } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windsor/instagram?date_preset=last_30d&account_id=...&access_token=...
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const datePreset = searchParams.get("date_preset") ?? "last_30d";
    const dateFrom = searchParams.get("date_from") ?? undefined;
    const dateTo = searchParams.get("date_to") ?? undefined;
    const accountId = searchParams.get("account_id") ?? undefined;
    const accessToken = searchParams.get("access_token") ?? undefined;

    const result = await queryWindsor({
      connector: CONNECTORS.INSTAGRAM,
      fields: [
        "date",
        "impressions",
        "reach",
        "profile_views",
        "follower_count",
        "followers_gained",
        "likes",
        "comments",
        "shares",
        "saves",
        "engagement_rate",
      ],
      ...(dateFrom && dateTo
        ? { date_from: dateFrom, date_to: dateTo }
        : { date_preset: datePreset }),
      ...(accountId && { account_id: accountId }),
      ...(accessToken && { access_token: accessToken }),
    });

    const rows = result.data ?? [];

    const totals = rows.reduce(
      (acc: Record<string, number>, row: Record<string, unknown>) => ({
        impressions: acc.impressions + (Number(row.impressions) || 0),
        reach: acc.reach + (Number(row.reach) || 0),
        likes: acc.likes + (Number(row.likes) || 0),
        comments: acc.comments + (Number(row.comments) || 0),
        shares: acc.shares + (Number(row.shares) || 0),
        saves: acc.saves + (Number(row.saves) || 0),
        followersGained: acc.followersGained + (Number(row.followers_gained) || 0),
      }),
      { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }
    );

    const latestFollowers = rows.length > 0
      ? Number((rows[rows.length - 1] as Record<string, unknown>).follower_count) || 0
      : 0;

    const avgEngagement = rows.length > 0
      ? (rows.reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.engagement_rate) || 0), 0) / rows.length).toFixed(2)
      : "0.00";

    return NextResponse.json({
      platform: "instagram",
      datePreset,
      rows,
      totals: {
        ...totals,
        followers: latestFollowers,
        engagementRate: parseFloat(avgEngagement),
      },
      meta: result.meta,
    });
  } catch (error) {
    console.error("Windsor Instagram error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Instagram data" },
      { status: 500 }
    );
  }
}
