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

    // Prevent self-demotion
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    // Get current user role
    const { data: targetUser } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    // Toggle role
    const newRole = targetUser?.role === "admin" ? "user" : "admin";
    const { error } = await adminSupabase
      .from("profiles")
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      console.error("Error toggling user role:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    console.error("Toggle role error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
