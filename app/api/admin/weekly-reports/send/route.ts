import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/admin/weekly-reports/send
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (role = 'admin')
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { userEmail, userName, summary, metrics, dashboardUrl, weekOf } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: "User email is required" }, { status: 400 });
    }

    // Send email using the email service
    const { sendWeeklyReportEmail } = await import("@/lib/email/email-service");
    
    await sendWeeklyReportEmail(userEmail, userName || "there", {
      weekOf: weekOf || new Date().toISOString().split("T")[0],
      summary: summary || "Check out your weekly performance!",
      totalSpend: 0,
      totalImpressions: metrics?.impressions || 0,
      totalClicks: metrics?.reactions || 0,
      topPlatform: "Instagram",
      dashboardUrl: dashboardUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/analytics`,
    });

    return NextResponse.json({ success: true, message: "Report sent successfully" });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json(
      { error: "Failed to send report" },
      { status: 500 }
    );
  }
}
