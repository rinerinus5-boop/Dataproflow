import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/complete-auth
 * Completes the OAuth flow by fetching accounts for the specific session
 * 1. Looks up pending connection by access_token
 * 2. Fetches accounts from Windsor filtered by access_token (gets only this session's accounts)
 * 3. Saves accounts to connected_accounts for the user
 * 4. Cleans up pending connection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: "access_token is required" }, { status: 400 });
    }

    // Find pending connection
    const { data: pending, error: pendingError } = await supabase
      .from("pending_connections")
      .select("*")
      .eq("windsor_access_token", access_token)
      .eq("user_id", user.id)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (pendingError || !pending) {
      return NextResponse.json({ 
        error: "No pending connection found or session expired. Please start over." 
      }, { status: 404 });
    }

    // Fetch accounts from Windsor filtered by THIS session's access_token
    // This returns ONLY the accounts connected in this specific session
    const sessionAccounts = await listLinkedAccounts(undefined, access_token);

    if (!sessionAccounts || sessionAccounts.length === 0) {
      return NextResponse.json({ 
        error: "No accounts found for this session. Please try connecting again." 
      }, { status: 404 });
    }

    // Save each account from this session to the user's connections
    const savedAccounts = [];
    for (const acc of sessionAccounts) {
      const windsorId = acc.id || acc.account_id;
      
      // Determine platform from ds_id
      let platform = pending.platform;
      const dsId = (acc.ds_id || "").toLowerCase().trim();
      
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

      const accountName = acc.account_name || acc.name || acc.co_user_member_name || acc.user_name || null;

      // Check if this account is already connected
      const { data: existing } = await supabase
        .from("connected_accounts")
        .select("id")
        .eq("windsor_account_id", windsorId)
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (existing) {
        // Update existing
        const { data: updated } = await supabase
          .from("connected_accounts")
          .update({ 
            platform_username: accountName,
            updated_at: new Date().toISOString()
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (updated) savedAccounts.push(updated);
      } else {
        // Insert new
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

        if (!insertError && saved) {
          savedAccounts.push(saved);
        }
      }
    }

    // Clean up pending connection
    await supabase
      .from("pending_connections")
      .delete()
      .eq("id", pending.id);

    return NextResponse.json({
      success: true,
      message: `Connected ${savedAccounts.length} account(s)`,
      accounts: savedAccounts,
    });
  } catch (error) {
    console.error("Complete auth error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete auth" },
      { status: 500 }
    );
  }
}
