import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyReportsReadyNotification } from "@/lib/email/email-service";

// GET /api/cron/weekly-reports
// Triggered by Vercel Cron - generates weekly reports and notifies admin
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.dataproflow.com";

    // Get all users with active subscriptions
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, plan, status")
      .in("status", ["active", "trialing"]);

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No active subscribers found",
        reportsGenerated: 0 
      });
    }

    const userIds = subscriptions.map((s) => s.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);

    const weekOf = new Date().toISOString().split("T")[0];
    const reports = [];

    // Generate draft reports for each user
    for (const profile of profiles || []) {
      // In production, fetch real Windsor data here
      const followers = Math.floor(Math.random() * 1000) + 200;
      const newFollowers = Math.floor(Math.random() * 100) + 20;
      const impressions = Math.floor(Math.random() * 100000) + 10000;
      const reactions = Math.floor(Math.random() * 2000) + 500;
      const engagementRate = Number((Math.random() * 5 + 1).toFixed(1));

      const summary = `Hi ${profile.full_name?.split(" ")[0] || "there"}, here's your weekly social media summary! You now have ${followers} followers (+${newFollowers} new this week!). Your content reached ${impressions.toLocaleString()} people and received ${reactions.toLocaleString()} reactions. ${engagementRate > 3 ? "Great job! Your engagement rate is above average." : "Keep posting quality content to boost your engagement!"}`;

      // Store in weekly_report_logs table
      try {
        await supabase.from("weekly_report_logs").insert({
          user_id: profile.id,
          week_of: weekOf,
          status: "draft",
          summary,
          metrics: {
            followers,
            new_followers: newFollowers,
            impressions,
            reactions,
            engagement_rate: engagementRate,
          },
        });
      } catch (dbError) {
        console.error(`Failed to log report for ${profile.id}:`, dbError);
      }

      reports.push({
        userId: profile.id,
        userEmail: profile.email,
        userName: profile.full_name,
        weekOf,
        status: "draft",
      });
    }

    // Send notification to admin
    if (reports.length > 0) {
      try {
        await sendWeeklyReportsReadyNotification(
          "info@dataproflow.com",
          reports.length,
          weekOf,
          `${siteUrl}/admin/weekly-reports`
        );
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Weekly reports generated successfully",
      weekOf,
      reportsGenerated: reports.length,
      adminNotified: reports.length > 0,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly reports" },
      { status: 500 }
    );
  }
}
