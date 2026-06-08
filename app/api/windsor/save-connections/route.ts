import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextResponse } from "next/server";

/**
 * POST /api/windsor/save-connections
 * Syncs EXISTING user connections with Windsor data
 * SECURITY: Only updates connections already in our DB - never adds other users' accounts
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get THIS USER'S existing connections from our database
    const { data: existingConnections, error: fetchError } = await supabase
      .from("connected_accounts")
      .select("id, windsor_account_id, platform, ds_id, platform_username")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (fetchError) {
      console.error("Failed to fetch existing connections:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // If user has no connections yet, nothing to sync
    if (!existingConnections || existingConnections.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No existing connections to sync. Connect an account first.",
        saved: 0 
      });
    }

    // Fetch all accounts from Windsor (team-level API)
    const windsorAccounts = await listLinkedAccounts();

    if (!windsorAccounts || windsorAccounts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No accounts found in Windsor",
        saved: 0 
      });
    }

    // Create a map of Windsor accounts by ID for quick lookup
    const windsorAccountMap = new Map();
    for (const acc of windsorAccounts) {
      const windsorId = acc.id || acc.account_id;
      if (windsorId) {
        windsorAccountMap.set(windsorId, acc);
      }
    }

    // Only update EXISTING user connections - NEVER add new ones from Windsor pool
    // This ensures we never show other users' accounts
    const updatedAccounts = [];
    for (const userConn of existingConnections) {
      const windsorAcc = windsorAccountMap.get(userConn.windsor_account_id);
      
      if (windsorAcc) {
        // Update with latest info from Windsor
        const accountName = windsorAcc.account_name || windsorAcc.name || windsorAcc.co_user_member_name || windsorAcc.user_name || userConn.platform_username;
        
        const { data: updated, error: updateError } = await supabase
          .from("connected_accounts")
          .update({
            platform_username: accountName,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userConn.id)
          .eq("user_id", user.id) // Extra safety: ensure we only update this user's record
          .select()
          .single();

        if (!updateError && updated) {
          updatedAccounts.push(updated);
        }
      } else {
        // Account no longer exists in Windsor - mark as inactive
        await supabase
          .from("connected_accounts")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", userConn.id)
          .eq("user_id", user.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${updatedAccounts.length} connections`,
      saved: updatedAccounts.length,
      accounts: updatedAccounts,
    });
  } catch (error) {
    console.error("Save connections error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save connections" },
      { status: 500 }
    );
  }
}
