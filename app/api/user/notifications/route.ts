import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Update notification preferences in profile
    const { error } = await supabase
      .from("profiles")
      .update({
        notification_preferences: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating notifications:", error);
      return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
