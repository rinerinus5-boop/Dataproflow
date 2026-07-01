import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/windsor/save-selected-account
 * Saves a specific Windsor account selected by the user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { session_token, windsor_account_id, account_name, platform, ds_id } = await request.json();

    if (!windsor_account_id) {
      return NextResponse.json({ error: "windsor_account_id is required" }, { status: 400 });
    }

    // Verify pending session exists
    if (session_token) {
      const { data: pending } = await supabase
        .from("pending_connections")
        .select("id")
        .eq("windsor_access_token", session_token)
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .single();

      // Clean up pending session if found
      if (pending) {
        await supabase.from("pending_connections").delete().eq("id", pending.id);
      }
    }

    // Check if already connected by this user
    const { data: existing } = await supabase
      .from("user_connections")
      .select("id")
      .eq("windsor_account_id", windsor_account_id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      const { data: updated } = await supabase
        .from("user_connections")
        .update({ 
          platform_username: account_name,
          platform: platform,
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: `Updated ${platform} account`,
        account: updated,
      });
    }

    // Insert new connection
    const { data: saved, error: insertError } = await supabase
      .from("user_connections")
      .insert({
        user_id: user.id,
        platform: platform || "unknown",
        platform_username: account_name,
        windsor_account_id: windsor_account_id,
        ds_id: ds_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to save selected account:", insertError);
      return NextResponse.json({ 
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Connected ${platform} account`,
      account: saved,
    });
  } catch (error) {
    console.error("Save selected account error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save account" },
      { status: 500 }
    );
  }
}
