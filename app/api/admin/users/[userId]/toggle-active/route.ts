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

    // Get current user status
    const { data: targetUser } = await adminSupabase
      .from("profiles")
      .select("is_active")
      .eq("id", userId)
      .single();

    // Toggle active status
    const { error } = await adminSupabase
      .from("profiles")
      .update({ 
        is_active: targetUser?.is_active === false ? true : false,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      console.error("Error toggling user status:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle active error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
