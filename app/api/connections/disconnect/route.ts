import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 }
      );
    }

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from("connected_accounts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", connectionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Disconnect error:", error);
      return NextResponse.json(
        { error: "Failed to disconnect account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
