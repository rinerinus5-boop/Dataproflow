import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/claim-account
 * Claims a new Windsor account for the current user
 * Finds the most recently created account that isn't in our DB yet
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platform: requestedPlatform } = await request.json().catch(() => ({ platform: null }));

    // Get all Windsor accounts
    const windsorAccounts = await listLinkedAccounts();

    if (!windsorAccounts || windsorAccounts.length === 0) {
      return NextResponse.json({ 
        error: "No accounts found in Windsor. Please connect an account first." 
      }, { status: 404 });
    }

    // Get all already-claimed account IDs from our database
    const { data: allConnections } = await supabase
      .from("connected_accounts")
      .select("windsor_account_id");

    const claimedIds = new Set((allConnections || []).map(c => c.windsor_account_id));

    // Find unclaimed accounts (not in our database yet)
    const unclaimedAccounts = windsorAccounts.filter(acc => {
      const windsorId = acc.id || acc.account_id;
      return windsorId && !claimedIds.has(windsorId);
    });

    if (unclaimedAccounts.length === 0) {
      return NextResponse.json({ 
        error: "No unclaimed accounts found. All Windsor accounts are already connected by other users." 
      }, { status: 404 });
    }

    // Sort by created_at to find newest (most likely the one they just added)
    unclaimedAccounts.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB.getTime() - dateA.getTime(); // Newest first
    });

    // If platform specified, try to find matching account
    let accountToClaim = unclaimedAccounts[0]; // Default to newest
    
    if (requestedPlatform) {
      const matchingAccount = unclaimedAccounts.find(acc => {
        const dsId = (acc.ds_id || "").toLowerCase();
        return dsId.includes(requestedPlatform.toLowerCase());
      });
      if (matchingAccount) {
        accountToClaim = matchingAccount;
      }
    }

    // Determine platform
    let platform = "unknown";
    const dsId = (accountToClaim.ds_id || "").toLowerCase().trim();
    
    if (dsId.includes("tiktok")) platform = "tiktok";
    else if (dsId.includes("instagram")) platform = "instagram";
    else if (dsId.includes("facebook")) platform = "facebook";
    else if (dsId.includes("google_ads")) platform = "google_ads";
    else if (dsId.includes("google_analytics")) platform = "google_analytics";
    else if (dsId.includes("linkedin")) platform = "linkedin";
    else if (dsId.includes("twitter") || dsId.includes("x_ads")) platform = "twitter";
    else if (dsId.includes("snapchat")) platform = "snapchat";
    else if (dsId.includes("pinterest")) platform = "pinterest";
    else if (dsId.includes("youtube")) platform = "youtube";

    const windsorId = accountToClaim.id || accountToClaim.account_id;
    const accountName = accountToClaim.account_name || accountToClaim.name || accountToClaim.co_user_member_name || accountToClaim.user_name || null;

    // Check if this user already has a connection for this platform
    const { data: existingSamePlatform } = await supabase
      .from("connected_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .eq("is_active", true)
      .single();

    if (existingSamePlatform) {
      return NextResponse.json({ 
        error: `You already have a ${platform} account connected. Disconnect it first to add a new one.` 
      }, { status: 400 });
    }

    // Save to database
    const { data: saved, error: insertError } = await supabase
      .from("connected_accounts")
      .insert({
        user_id: user.id,
        platform: platform,
        platform_username: accountName,
        windsor_account_id: windsorId,
        ds_id: accountToClaim.ds_id,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to claim account:", insertError);
      return NextResponse.json({ error: "Failed to save connection" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${platform} account`,
      account: saved,
    });
  } catch (error) {
    console.error("Claim account error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to claim account" },
      { status: 500 }
    );
  }
}
