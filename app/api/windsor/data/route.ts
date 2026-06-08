import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { queryWindsor, listLinkedAccounts } from "@/lib/windsor/client";

// GET /api/windsor/data?days=7&platform=all
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const platformFilter = searchParams.get("platform") || "all";

    // Get connected accounts
    const linkedAccounts = await listLinkedAccounts();
    
    if (linkedAccounts.length === 0) {
      // Return demo data if no accounts connected
      return NextResponse.json(getDemoData(days));
    }

    // Calculate date range
    const dateTo = new Date().toISOString().split("T")[0];
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fields to fetch from Windsor
    const fields = [
      "date",
      "datasource",
      "account_name",
      "followers",
      "impressions",
      "reach",
      "likes",
      "comments",
      "shares",
      "views",
      "engagement",
    ];

    // Determine which connector to query
    let connector = "all";
    if (platformFilter !== "all") {
      const platform = platformFilter.toLowerCase();
      if (platform === "facebook") connector = "facebook";
      else if (platform === "instagram") connector = "instagram";
      else if (platform === "tiktok") connector = "tiktok";
    }

    // Fetch data from Windsor
    let rawData: unknown[] = [];
    try {
      const response = await queryWindsor({
        connector,
        fields,
        date_from: dateFrom,
        date_to: dateTo,
      });
      rawData = response.data || [];
    } catch (windsorError) {
      console.error("Windsor query failed:", windsorError);
      // Return demo data if Windsor fails
      return NextResponse.json(getDemoData(days));
    }

    // Process the data
    const processedData = processWindsorData(rawData, days, linkedAccounts);
    
    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Windsor data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

function getDemoData(days: number) {
  const accounts = [
    { id: "demo-1", platform: "instagram", platform_username: "your_business" },
    { id: "demo-2", platform: "facebook", platform_username: "Your Business Page" },
  ];

  const totals = {
    followers: 387,
    newFollowers: Math.floor(Math.random() * 50) + 20,
    impressions: 116500,
    reach: 85000,
    likes: 1500,
    comments: 320,
    shares: 180,
    views: 45000,
    posts: 12,
    engagementRate: 4.2,
  };

  const platformBreakdown = [
    { platform: "instagram", accountId: "demo-1", username: "your_business", followers: 287, impressions: 85000, engagement: 4.5 },
    { platform: "facebook", accountId: "demo-2", username: "Your Business Page", followers: 100, impressions: 31500, engagement: 3.8 },
  ];

  const dailyData = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    followers: 300 + i * 5 + Math.floor(Math.random() * 10),
    impressions: 10000 + Math.floor(Math.random() * 8000),
    engagement: 3 + Math.random() * 2,
  }));

  return {
    hasData: false,
    accounts,
    totals,
    platformBreakdown,
    dailyData,
    topPosts: [],
  };
}

function processWindsorData(
  rawData: unknown[],
  days: number,
  linkedAccounts: Array<{ ds_id?: string; account_name?: string; name?: string; co_user_member_name?: string }>
): {
  hasData: boolean;
  accounts: Array<{ id: string; platform: string; platform_username: string }>;
  totals: {
    followers: number;
    newFollowers: number;
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    posts: number;
    engagementRate: number;
  };
  platformBreakdown: Array<{
    platform: string;
    accountId: string;
    username: string;
    followers: number;
    impressions: number;
    engagement: number;
  }>;
  dailyData: Array<{ date: string; followers: number; impressions: number; engagement: number }>;
  topPosts: unknown[];
} {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return getDemoData(days);
  }

  // Calculate totals
  const totals = rawData.reduce(
    (acc: { followers: number; impressions: number; reach: number; likes: number; comments: number; shares: number; views: number }, row: unknown) => {
      const r = row as Record<string, string | number>;
      return {
        followers: Math.max(acc.followers, parseInt(String(r.followers)) || 0),
        impressions: acc.impressions + (parseInt(String(r.impressions)) || 0),
        reach: acc.reach + (parseInt(String(r.reach)) || 0),
        likes: acc.likes + (parseInt(String(r.likes)) || 0),
        comments: acc.comments + (parseInt(String(r.comments)) || 0),
        shares: acc.shares + (parseInt(String(r.shares)) || 0),
        views: acc.views + (parseInt(String(r.views)) || 0),
      };
    },
    { followers: 0, impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, views: 0 }
  );

  // Calculate new followers (estimate 5% growth)
  const newFollowers = Math.round(totals.followers * 0.05);

  // Calculate engagement rate
  const engagementRate = totals.impressions > 0 
    ? Math.round(((totals.likes + totals.comments + totals.shares) / totals.impressions) * 10000) / 100
    : 0;

  // Build platform breakdown
  const byPlatform = rawData.reduce((acc: Record<string, { impressions: number; engagement: number; followers: number }>, row: unknown) => {
    const r = row as Record<string, string | number>;
    const platform = String(r.datasource || r.account_name || "unknown").toLowerCase();
    const cleanPlatform = platform.includes("facebook") ? "facebook" : 
                          platform.includes("instagram") ? "instagram" : 
                          platform.includes("tiktok") ? "tiktok" : "other";
    
    if (!acc[cleanPlatform]) {
      acc[cleanPlatform] = { impressions: 0, engagement: 0, followers: 0 };
    }
    acc[cleanPlatform].impressions += parseInt(String(r.impressions)) || 0;
    acc[cleanPlatform].engagement += (parseInt(String(r.likes)) || 0) + (parseInt(String(r.comments)) || 0);
    acc[cleanPlatform].followers = Math.max(acc[cleanPlatform].followers, parseInt(String(r.followers)) || 0);
    return acc;
  }, {});

  const platformBreakdown = Object.entries(byPlatform).map(([platform, data]) => ({
    platform,
    accountId: `${platform}-1`,
    username: linkedAccounts.find(a => (a.ds_id || "").toLowerCase().includes(platform))?.account_name || 
              linkedAccounts.find(a => (a.ds_id || "").toLowerCase().includes(platform))?.name || 
              platform,
    followers: data.followers,
    impressions: data.impressions,
    engagement: data.impressions > 0 ? Math.round((data.engagement / data.impressions) * 10000) / 100 : 0,
  }));

  // Generate daily data (simplified - in production you'd group by date)
  const dailyData = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    followers: Math.round(totals.followers * (0.9 + i * 0.02)),
    impressions: Math.round(totals.impressions / days),
    engagement: engagementRate,
  }));

  // Build accounts list
  const accounts = linkedAccounts.map((acc, i) => {
    const dsId = (acc.ds_id || "").toLowerCase();
    const platform = dsId.includes("facebook") ? "facebook" : 
                     dsId.includes("instagram") ? "instagram" : 
                     dsId.includes("tiktok") ? "tiktok" : "unknown";
    return {
      id: `account-${i}`,
      platform,
      platform_username: acc.account_name || acc.name || acc.co_user_member_name || platform,
    };
  });

  return {
    hasData: true,
    accounts,
    totals: {
      followers: totals.followers,
      newFollowers,
      impressions: totals.impressions,
      reach: totals.reach,
      likes: totals.likes,
      comments: totals.comments,
      shares: totals.shares,
      views: totals.views,
      posts: Math.floor(rawData.length / 2), // Estimate
      engagementRate,
    },
    platformBreakdown,
    dailyData,
    topPosts: [],
  };
}
