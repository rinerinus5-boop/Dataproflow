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

    // Map ALL accounts - don't filter by platform, let user pick
    const requestedPlatform = pending.platform.toLowerCase();
    const allMappedAccounts = allAccounts.map(acc => {
      // Log each account for debugging
      console.log("Processing account:", JSON.stringify(acc));
      
      // Windsor returns various field names - try all common ones
      const windsorId = String(acc.id || acc.account_id || acc.accountId || acc.profile_id || acc.profileId || acc.property_id || acc.propertyId || "").trim();
      const dsId = String(acc.ds_id || acc.datasource || acc.source || "").toLowerCase().trim();
      const accountName = String(acc.account_name || acc.name || acc.accountName || acc.profile_name || acc.property_name || acc.co_user_member_name || acc.user_name || acc.email || "").trim() || null;
      
      // Detect platform from ds_id
      let platform = "unknown";
      if (dsId.includes("tiktok")) platform = "tiktok";
      else if (dsId.includes("instagram")) platform = "instagram";
      else if (dsId.includes("facebook")) platform = "facebook";
      else if (dsId.includes("google_ads")) platform = "google_ads";
      else if (dsId.includes("google_analytics")) platform = "google_analytics";
      else if (dsId.includes("linkedin")) platform = "linkedin";
      else if (dsId.includes("snapchat")) platform = "snapchat";
      else if (dsId.includes("pinterest")) platform = "pinterest";
      else if (dsId.includes("twitter") || dsId.includes("x_ads")) platform = "twitter";
      
      return {
        ...acc,
        windsor_account_id: windsorId || dsId || String(Math.random()).slice(2, 10),
        platform,
        ds_id: dsId || null,
        account_name: accountName,
        claimed_by_user: claimedMap.get(windsorId) === user.id,
        claimed_by_other: claimedMap.has(windsorId) && claimedMap.get(windsorId) !== user.id,
      };
    });

    console.log("All mapped accounts:", JSON.stringify(allMappedAccounts, null, 2));

    if (allMappedAccounts.length === 0) {
      return NextResponse.json({ 
        error: "No accounts found. Windsor returned empty data. Please try again or contact support.",
        debug: { raw_count: allAccounts.length }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      accounts: allMappedAccounts,
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
