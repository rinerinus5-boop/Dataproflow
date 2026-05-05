import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unread") === "true";

    // Fetch notifications
    let query = supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { notificationIds, markAllRead } = await request.json();

    if (markAllRead) {
      // Mark all as read
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) {
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        );
      }
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from("admin_notifications")
        .update({ is_read: true })
        .in("id", notificationIds);

      if (error) {
        return NextResponse.json(
          { error: "Failed to mark notifications as read" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
