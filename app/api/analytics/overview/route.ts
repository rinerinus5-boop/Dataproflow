import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get connected accounts
    const { data: connectedAccounts } = await supabase
      .from("connected_accounts")
      .select("id, platform, platform_username")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!connectedAccounts || connectedAccounts.length === 0) {
      return NextResponse.json({
        hasData: false,
        accounts: [],
        totals: {
          followers: 0,
          impressions: 0,
          reach: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          posts: 0,
        },
        platformBreakdown: [],
        topPosts: [],
        recentMetrics: [],
      });
    }

    // Get latest metrics for each connected account
    const { data: latestMetrics } = await supabase
      .from("platform_metrics")
      .select("*")
      .eq("user_id", user.id)
      .order("metric_date", { ascending: false });

    // Get top performing posts
    const { data: topPosts } = await supabase
      .from("platform_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("likes_count", { ascending: false })
      .limit(10);

    // Get metrics for the last 30 days for trend calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentMetrics } = await supabase
      .from("platform_metrics")
      .select("*")
      .eq("user_id", user.id)
      .gte("metric_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("metric_date", { ascending: true });

    // Calculate totals from latest metrics (one per account)
    const accountMetrics = new Map();
    for (const metric of latestMetrics || []) {
      if (!accountMetrics.has(metric.connected_account_id)) {
        accountMetrics.set(metric.connected_account_id, metric);
      }
    }

    const totals = {
      followers: 0,
      impressions: 0,
      reach: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      posts: 0,
    };

    const platformBreakdown: Array<{
      platform: string;
      accountId: string;
      username: string;
      followers: number;
      impressions: number;
      engagement: number;
    }> = [];

    for (const [accountId, metric] of accountMetrics) {
      const account = connectedAccounts.find((a) => a.id === accountId);
      
      totals.followers += metric.followers_count || 0;
      totals.impressions += metric.total_impressions || 0;
      totals.reach += metric.total_reach || 0;
      totals.likes += metric.total_likes || 0;
      totals.comments += metric.total_comments || 0;
      totals.shares += metric.total_shares || 0;
      totals.views += metric.total_views || 0;
      totals.posts += metric.posts_count || 0;

      platformBreakdown.push({
        platform: metric.platform,
        accountId,
        username: account?.platform_username || metric.platform,
        followers: metric.followers_count || 0,
        impressions: metric.total_impressions || 0,
        engagement: metric.engagement_rate || 0,
      });
    }

    // Also include connected accounts that have no metrics yet
    for (const account of connectedAccounts) {
      if (!accountMetrics.has(account.id)) {
        platformBreakdown.push({
          platform: account.platform,
          accountId: account.id,
          username: account.platform_username || account.platform,
          followers: 0,
          impressions: 0,
          engagement: 0,
        });
      }
    }

    // Calculate engagement rate
    const engagementRate =
      totals.impressions > 0
        ? (((totals.likes + totals.comments + totals.shares) / totals.impressions) * 100).toFixed(2)
        : "0.00";

    // Format top posts
    const formattedTopPosts = (topPosts || []).map((post) => ({
      id: post.id,
      platform: post.platform,
      type: post.post_type,
      caption: post.caption?.substring(0, 100) + (post.caption?.length > 100 ? "..." : ""),
      thumbnail: post.thumbnail_url || post.media_url,
      permalink: post.permalink,
      likes: post.likes_count,
      comments: post.comments_count,
      shares: post.shares_count,
      views: post.views_count,
      postedAt: post.posted_at,
    }));

    // Format recent metrics for chart
    const formattedRecentMetrics = (recentMetrics || []).map((m) => ({
      date: m.metric_date,
      platform: m.platform,
      followers: m.followers_count,
      impressions: m.total_impressions,
      reach: m.total_reach,
      likes: m.total_likes,
    }));

    return NextResponse.json({
      hasData: connectedAccounts.length > 0,
      accounts: connectedAccounts,
      totals: {
        ...totals,
        engagementRate: parseFloat(engagementRate),
      },
      platformBreakdown,
      topPosts: formattedTopPosts,
      recentMetrics: formattedRecentMetrics,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
