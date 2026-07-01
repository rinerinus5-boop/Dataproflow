import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/complete-auth
 * Fetches available Windsor accounts for the user to select from
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_token } = await request.json();

    if (!session_token) {
      return NextResponse.json({ error: "session_token is required" }, { status: 400 });
    }

    // Find pending connection for this user
    const { data: pending, error: pendingError } = await supabase
      .from("pending_connections")
      .select("*")
      .eq("windsor_access_token", session_token)
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (pendingError || !pending) {
      return NextResponse.json({ 
        error: "Session expired. Please try connecting again." 
      }, { status: 404 });
    }

    // Fetch ALL accounts from Windsor - try multiple times with delay
    let allAccounts = await listLinkedAccounts();
    console.log("Windsor accounts response (attempt 1):", JSON.stringify(allAccounts, null, 2));
    
    // If empty, wait 2 seconds and try again (Windsor might be slow to sync)
    if (!allAccounts || allAccounts.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      allAccounts = await listLinkedAccounts();
      console.log("Windsor accounts response (attempt 2):", JSON.stringify(allAccounts, null, 2));
    }

    if (!allAccounts || allAccounts.length === 0) {
      // Clean up pending and return error with debug info
      await supabase.from("pending_connections").delete().eq("id", pending.id);
      return NextResponse.json({ 
        error: "Windsor returned no accounts. This might be a sync delay. Please wait 30 seconds and try connecting again.",
        debug: { windsor_raw: allAccounts }
      }, { status: 404 });
    }

    // Get all already-claimed account IDs from our database
    const adminSupabase = createAdminClient();
    const { data: allConnections } = await adminSupabase
      .from("connected_accounts")
      .select("windsor_account_id, user_id")
      .eq("is_active", true);

    const claimedMap = new Map((allConnections || []).map(c => [c.windsor_account_id, c.user_id]));

    // Windsor returns nested structure: { link: {...}, accounts: [{account_id, account_name, datasource}] }
    // We need to flatten and extract the real account data
    const requestedPlatform = pending.platform.toLowerCase();
    
    const allMappedAccounts: any[] = [];
    
    for (const item of allAccounts) {
      const link = (item as any).link || {};
      const nestedAccounts = (item as any).accounts || [];
      const addedAt = link.issued_at || (item as any).added || (item as any).created_at || "";
      
      // If there are nested accounts, use those (this is the real data)
      if (nestedAccounts.length > 0) {
        for (const acc of nestedAccounts) {
          const accountId = String(acc.account_id || acc.id || "").trim();
          const accountName = String(acc.account_name || acc.name || "").trim();
          const datasource = String(acc.datasource || acc.ds_id || "").toLowerCase();
          
          // Skip if no account_id or if deactivated
          if (!accountId || acc.is_deactivated || acc.error) continue;
          
          // Detect platform
          let platform = "unknown";
          if (datasource.includes("tiktok")) platform = "tiktok";
          else if (datasource.includes("instagram")) platform = "instagram";
          else if (datasource.includes("facebook")) platform = "facebook";
          else if (datasource.includes("google_ads")) platform = "google_ads";
          else if (datasource.includes("google_analytics")) platform = "google_analytics";
          else if (datasource.includes("linkedin")) platform = "linkedin";
          else if (datasource.includes("snapchat")) platform = "snapchat";
          else if (datasource.includes("pinterest")) platform = "pinterest";
          else if (datasource.includes("twitter") || datasource.includes("x_ads")) platform = "twitter";
          
          allMappedAccounts.push({
            windsor_account_id: accountId,
            account_name: accountName || null,
            platform,
            ds_id: datasource,
            added_at: acc.added || acc.updated || addedAt,
            claimed_by_user: claimedMap.get(accountId) === user.id,
            claimed_by_other: claimedMap.has(accountId) && claimedMap.get(accountId) !== user.id,
          });
        }
      }
    }
    
    // Sort by added_at descending (newest first) and limit to 6
    const sortedAccounts = allMappedAccounts
      .sort((a, b) => {
        const dateA = new Date(a.added_at || 0).getTime();
        const dateB = new Date(b.added_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 6);

    console.log("Mapped accounts (newest 6):", JSON.stringify(sortedAccounts, null, 2));

    if (sortedAccounts.length === 0) {
      return NextResponse.json({ 
        error: "No valid accounts found. Please make sure you completed the authorization in Windsor.",
        debug: { raw_count: allAccounts.length }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      accounts: sortedAccounts,
      pending_id: pending.id,
      session_token,
    });
  } catch (error) {
    console.error("Complete auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete auth" },
      { status: 500 }
    );
  }
}
