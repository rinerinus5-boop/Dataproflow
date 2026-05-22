import { createClient } from "@/lib/supabase/server";
import { queryWindsor, CONNECTORS } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windsor/facebook?date_preset=last_30d&account_id=...&access_token=...
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
      connector: CONNECTORS.FACEBOOK,
      fields: [
        "date",
        "campaign",
        "impressions",
        "clicks",
        "spend",
        "reach",
        "frequency",
        "cpm",
        "ctr",
        "cpc",
        "conversions",
        "cost_per_conversion",
        "roas",
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
        clicks: acc.clicks + (Number(row.clicks) || 0),
        spend: acc.spend + (Number(row.spend) || 0),
        conversions: acc.conversions + (Number(row.conversions) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const avgCTR = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : "0.00";
    const avgCPC = totals.clicks > 0
      ? (totals.spend / totals.clicks).toFixed(2)
      : "0.00";
    const avgROAS = rows.length > 0
      ? (rows.reduce((sum: number, r: Record<string, unknown>) => sum + (Number(r.roas) || 0), 0) / rows.length).toFixed(2)
      : "0.00";

    return NextResponse.json({
      platform: "facebook",
      datePreset,
      rows,
      totals: {
        ...totals,
        ctr: parseFloat(avgCTR),
        cpc: parseFloat(avgCPC),
        roas: parseFloat(avgROAS),
      },
      meta: result.meta,
    });
  } catch (error) {
    console.error("Windsor Facebook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Facebook data" },
      { status: 500 }
    );
  }
}
