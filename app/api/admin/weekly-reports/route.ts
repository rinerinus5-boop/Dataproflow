import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admin/weekly-reports
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all users with subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, plan, status")
      .in("status", ["active", "trialing"]);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ reports: [] });
    }

    const userIds = subscriptions.map((s) => s.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const weekOf = new Date().toISOString().split("T")[0];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dataproflow.com";

    const reports = (profiles || []).map((profile) => {
      // Generate demo metrics (in production, fetch from Windsor)
      const followers = Math.floor(Math.random() * 1000) + 200;
      const newFollowers = Math.floor(Math.random() * 100) + 20;
      const impressions = Math.floor(Math.random() * 100000) + 10000;
      const reactions = Math.floor(Math.random() * 2000) + 500;
      const engagementRate = Number((Math.random() * 5 + 1).toFixed(1));

      return {
        id: `${profile.id}-${weekOf}`,
        userId: profile.id,
        userName: profile.full_name || "User",
        userEmail: profile.email,
        weekOf,
        metrics: {
          followers,
          newFollowers,
          impressions,
          reactions,
          engagementRate,
        },
        summary: `Hi ${profile.full_name?.split(" ")[0] || "there"}, here's your weekly social media summary! You now have ${followers} followers (+${newFollowers} new this week!). Your content reached ${impressions.toLocaleString()} people and received ${reactions.toLocaleString()} reactions. ${engagementRate > 3 ? "Great job! Your engagement rate is above average." : "Keep posting quality content to boost your engagement!"}`,
        status: "draft" as const,
        dashboardUrl: `${siteUrl}/dashboard/analytics`,
      };
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Weekly reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST /api/admin/weekly-reports
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Return same as GET (generation happens on fetch)
    return GET();
  } catch (error) {
    console.error("Generate reports error:", error);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
