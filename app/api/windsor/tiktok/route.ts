import { createClient } from "@/lib/supabase/server";
import { queryWindsor, CONNECTORS } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windsor/tiktok?type=organic|ads&date_preset=last_30d&account_id=...&access_token=...
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") ?? "organic";
    const datePreset = searchParams.get("date_preset") ?? "last_30d";
    const dateFrom = searchParams.get("date_from") ?? undefined;
    const dateTo = searchParams.get("date_to") ?? undefined;
    const accountId = searchParams.get("account_id") ?? undefined;
    const accessToken = searchParams.get("access_token") ?? undefined;

    const connector = type === "ads" ? CONNECTORS.TIKTOK_ADS : CONNECTORS.TIKTOK;

    const organicFields = [
      "date", "video_views", "likes", "comments", "shares",
      "followers", "net_followers", "profile_views", "reach", "impressions",
    ];

    const adsFields = [
      "date", "campaign", "impressions", "clicks", "spend",
      "video_views", "ctr", "cpm", "cpc", "conversions", "cost_per_conversion", "roas",
    ];

    const result = await queryWindsor({
      connector,
      fields: type === "ads" ? adsFields : organicFields,
      ...(dateFrom && dateTo
        ? { date_from: dateFrom, date_to: dateTo }
        : { date_preset: datePreset }),
      ...(accountId && { account_id: accountId }),
      ...(accessToken && { access_token: accessToken }),
    });

    const rows = result.data ?? [];

    let totals: Record<string, number> = {};

    if (type === "ads") {
      totals = rows.reduce(
        (acc: Record<string, number>, row: Record<string, unknown>) => ({
          impressions: acc.impressions + (Number(row.impressions) || 0),
          clicks: acc.clicks + (Number(row.clicks) || 0),
          spend: acc.spend + (Number(row.spend) || 0),
          videoViews: acc.videoViews + (Number(row.video_views) || 0),
          conversions: acc.conversions + (Number(row.conversions) || 0),
        }),
        { impressions: 0, clicks: 0, spend: 0, videoViews: 0, conversions: 0 }
      );
    } else {
      totals = rows.reduce(
        (acc: Record<string, number>, row: Record<string, unknown>) => ({
          videoViews: acc.videoViews + (Number(row.video_views) || 0),
          likes: acc.likes + (Number(row.likes) || 0),
          comments: acc.comments + (Number(row.comments) || 0),
          shares: acc.shares + (Number(row.shares) || 0),
          netFollowers: acc.netFollowers + (Number(row.net_followers) || 0),
          reach: acc.reach + (Number(row.reach) || 0),
        }),
        { videoViews: 0, likes: 0, comments: 0, shares: 0, netFollowers: 0, reach: 0 }
      );

      totals.followers = rows.length > 0
        ? Number((rows[rows.length - 1] as Record<string, unknown>).followers) || 0
        : 0;
    }

    return NextResponse.json({
      platform: "tiktok",
      type,
      datePreset,
      rows,
      totals,
      meta: result.meta,
    });
  } catch (error) {
    console.error("Windsor TikTok error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch TikTok data" },
      { status: 500 }
    );
  }
}
