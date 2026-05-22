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
      ds_id: DS_IDS.FACEBOOK_ADS,
      ds_accounts: account,
      fields: [
        "Date",
        "Impressions",
        "Clicks",
        "Spend",
        "Reach",
        "Frequency",
        "CPM",
        "CTR",
        "CPC",
        "Conversions",
        "CostPerConversion",
        "ROAS",
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
        clicks: acc.clicks + (parseFloat(row.Clicks) || 0),
        spend: acc.spend + (parseFloat(row.Spend) || 0),
        conversions: acc.conversions + (parseFloat(row.Conversions) || 0),
      }),
      { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
    );

    const avgCTR = totals.impressions > 0
      ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
      : "0.00";

    const avgCPC = totals.clicks > 0
      ? (totals.spend / totals.clicks).toFixed(2)
      : "0.00";

    const roas = totals.spend > 0
      ? rows.reduce((sum, r) => sum + (parseFloat(r.ROAS) || 0), 0) / rows.length
      : 0;

    return NextResponse.json({
      platform: "facebook",
      account,
      dateRange,
      rows,
      totals: {
        ...totals,
        ctr: parseFloat(avgCTR),
        cpc: parseFloat(avgCPC),
        roas: parseFloat(roas.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Supermetrics Facebook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch Facebook data" },
      { status: 500 }
    );
  }
}
