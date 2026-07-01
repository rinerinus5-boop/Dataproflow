import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextResponse } from "next/server";

/**
 * GET /api/windsor/debug-accounts
 * Returns raw Windsor account data for debugging
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await listLinkedAccounts();

    return NextResponse.json({
      user_id: user.id,
      count: accounts.length,
      accounts: accounts,
    });
  } catch (error) {
    console.error("Debug accounts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch debug accounts" },
      { status: 500 }
    );
  }
}
