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

    const { data: connections, error } = await supabase
      .from("connected_accounts")
      .select("id, platform, platform_username, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching connections:", error);
      return NextResponse.json(
        { error: "Failed to fetch connections" },
        { status: 500 }
      );
    }

    return NextResponse.json({ connections: connections || [] });
  } catch (error) {
    console.error("Connections API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
