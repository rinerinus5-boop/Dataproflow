import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;
const ONBOARD_URL = "https://onboard.windsor.ai";

/**
 * POST /api/windsor/disconnect
 * Disconnect a user's linked account (deletes from our database + optionally Windsor)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // First, verify this connection belongs to the current user
    const { data: connection, error: fetchError } = await supabase
      .from("connected_accounts")
      .select("id, windsor_account_id")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !connection) {
      return NextResponse.json(
        { error: "Connection not found or access denied" },
        { status: 404 }
      );
    }

    // Soft delete from OUR database (set is_active = false)
    // This is what matters for per-user isolation
    const { error: deleteError } = await supabase
      .from("connected_accounts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Failed to delete connection from database:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove connection" },
        { status: 500 }
      );
    }

    // Optionally: Also disconnect from Windsor API if we have the Windsor account ID
    // This is secondary - the important part is it's removed from our DB
    if (connection.windsor_account_id) {
      try {
        const url = `${ONBOARD_URL}/api/team/co-user-linked-accounts/${connection.windsor_account_id}/?api_key=${WINDSOR_API_KEY}`;
        await fetch(url, { 
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        // We don't fail if Windsor delete fails - our DB is the source of truth now
      } catch (windsorError) {
        console.warn("Windsor disconnect failed (non-critical):", windsorError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Connection removed successfully" 
    });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    );
  }
}
