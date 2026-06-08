import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextResponse } from "next/server";

/**
 * POST /api/windsor/save-connections
 * Fetches accounts from Windsor and saves them to our database
 * Called after OAuth success to sync new connections
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch accounts from Windsor
    const windsorAccounts = await listLinkedAccounts();

    if (!windsorAccounts || windsorAccounts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No accounts found in Windsor",
        saved: 0 
      });
    }

    // Get existing connections for this user to avoid duplicates
    const { data: existingConnections } = await supabase
      .from("connected_accounts")
      .select("windsor_account_id, platform")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const existingIds = new Set(
      (existingConnections || []).map(c => c.windsor_account_id)
    );

    // Save each new connection
    const savedAccounts = [];
    for (const acc of windsorAccounts) {
      const windsorId = acc.id || acc.account_id;
      
      // Skip if already exists
      if (existingIds.has(windsorId)) {
        continue;
      }

      // Determine platform from ds_id
      let platform = "unknown";
      const dsId = (acc.ds_id || "").toLowerCase().trim();
      
      if (dsId.includes("tiktok")) {
        platform = "tiktok";
      } else if (dsId.includes("instagram")) {
        platform = "instagram";
      } else if (dsId.includes("facebook")) {
        platform = "facebook";
      } else if (dsId.includes("google_ads")) {
        platform = "google_ads";
      } else if (dsId.includes("google_analytics")) {
        platform = "google_analytics";
      } else if (dsId.includes("linkedin")) {
        platform = "linkedin";
      } else if (dsId.includes("twitter") || dsId.includes("x_ads")) {
        platform = "twitter";
      } else if (dsId.includes("snapchat")) {
        platform = "snapchat";
      } else if (dsId.includes("pinterest")) {
        platform = "pinterest";
      } else if (dsId.includes("youtube")) {
        platform = "youtube";
      }

      // Get display name
      const accountName = acc.account_name || acc.name || acc.co_user_member_name || acc.user_name || null;

      // Insert into database
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

      if (insertError) {
        console.error("Failed to save connection:", insertError);
      } else {
        savedAccounts.push(saved);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Saved ${savedAccounts.length} new connections`,
      saved: savedAccounts.length,
      accounts: savedAccounts,
    });
  } catch (error) {
    console.error("Save connections error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save connections" },
      { status: 500 }
    );
  }
}
