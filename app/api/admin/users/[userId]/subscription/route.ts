import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Check if current user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, plan } = body;

    switch (action) {
      case "upgrade":
      case "downgrade":
        if (!plan) {
          return NextResponse.json({ error: "Plan is required" }, { status: 400 });
        }
        await adminSupabase
          .from("subscriptions")
          .update({ plan, status: "active" })
          .eq("user_id", userId);
        break;

      case "cancel":
        await adminSupabase
          .from("subscriptions")
          .update({ status: "canceled", cancel_at_period_end: true })
          .eq("user_id", userId);
        break;

      case "reset_trial":
        await adminSupabase
          .from("subscriptions")
          .update({
            status: "trialing",
            trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq("user_id", userId);
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin subscription update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
