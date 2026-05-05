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

    // Prevent self-deletion
    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Delete user's data from all tables
    await adminSupabase.from("connected_accounts").delete().eq("user_id", userId);
    await adminSupabase.from("subscriptions").delete().eq("user_id", userId);
    await adminSupabase.from("profiles").delete().eq("id", userId);

    // Delete user from auth
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
