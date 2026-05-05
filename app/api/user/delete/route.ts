import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function DELETE() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user's data from all tables
    await adminSupabase.from("connected_accounts").delete().eq("user_id", user.id);
    await adminSupabase.from("subscriptions").delete().eq("user_id", user.id);
    await adminSupabase.from("profiles").delete().eq("id", user.id);

    // Delete user from auth
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
