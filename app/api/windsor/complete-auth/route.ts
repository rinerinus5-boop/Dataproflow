import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/complete-auth
 * Completes OAuth by finding the newest Windsor account and assigning to user
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

    // Fetch ALL accounts from Windsor
    const allAccounts = await listLinkedAccounts();

    if (!allAccounts || allAccounts.length === 0) {
      // Clean up pending
      await supabase.from("pending_connections").delete().eq("id", pending.id);
      return NextResponse.json({ 
        error: "No accounts found. Please complete the authorization on Windsor." 
      }, { status: 404 });
    }

    // Get all already-claimed account IDs from our database (use admin to bypass RLS)
    const adminSupabase = createAdminClient();
    const { data: allConnections } = await adminSupabase
      .from("connected_accounts")
      .select("windsor_account_id")
      .eq("is_active", true);

    const claimedIds = new Set((allConnections || []).map(c => c.windsor_account_id));

    // Find accounts matching the requested platform that aren't claimed
    const requestedPlatform = pending.platform.toLowerCase();
    const matchingUnclaimed = allAccounts.filter(acc => {
      const windsorId = acc.id || acc.account_id;
      if (!windsorId || claimedIds.has(windsorId)) return false;
      
      const dsId = (acc.ds_id || "").toLowerCase();
      if (requestedPlatform === "unknown") return true;
      return dsId.includes(requestedPlatform);
    });

    // Sort by created_at descending to get newest first
    matchingUnclaimed.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    if (matchingUnclaimed.length === 0) {
      await supabase.from("pending_connections").delete().eq("id", pending.id);
      return NextResponse.json({ 
        error: "No new accounts found. The account may already be connected." 
      }, { status: 404 });
    }

    // Take the newest unclaimed account
    const acc = matchingUnclaimed[0];
    const windsorId = acc.id || acc.account_id;
    
    // Determine platform
    let platform = pending.platform;
    const dsId = (acc.ds_id || "").toLowerCase().trim();
    if (dsId.includes("tiktok")) platform = "tiktok";
    else if (dsId.includes("instagram")) platform = "instagram";
    else if (dsId.includes("facebook")) platform = "facebook";
    else if (dsId.includes("google_ads")) platform = "google_ads";
    else if (dsId.includes("linkedin")) platform = "linkedin";

    const accountName = acc.account_name || acc.name || acc.co_user_member_name || acc.user_name || null;

    // Save to database
    const { data: saved, error: insertError } = await supabase
      .from("connected_accounts")
      .insert({
        user_id: user.id,
        platform: platform,
        platform_username: accountName,
        windsor_account_id: windsorId,
        ds_id: acc.ds_id,
        is_active: true,
      })
      .select()
      .single();

    // Clean up pending connection
    await supabase.from("pending_connections").delete().eq("id", pending.id);

    if (insertError) {
      console.error("Failed to save connection:", insertError);
      return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Connected ${platform} account`,
      accounts: [saved],
    });
  } catch (error) {
    console.error("Complete auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete auth" },
      { status: 500 }
    );
  }
}
