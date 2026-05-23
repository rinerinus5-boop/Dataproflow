import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const WINDSOR_API_KEY = process.env.WINDSOR_API_KEY!;
const ONBOARD_URL = "https://onboard.windsor.ai";

/**
 * POST /api/windsor/disconnect
 * Disconnect a Windsor.ai linked account
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

    // Call Windsor API to disconnect the account
    // Windsor uses DELETE method to remove linked accounts
    const url = `${ONBOARD_URL}/api/team/co-user-linked-accounts/${accountId}/?api_key=${WINDSOR_API_KEY}`;
    
    const response = await fetch(url, { 
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Windsor may return 404 if account doesn't exist or 204 on success
    if (response.ok || response.status === 204 || response.status === 404) {
      return NextResponse.json({ success: true });
    }

    const errorData = await response.json().catch(() => ({}));
    console.error("Windsor disconnect error:", response.status, errorData);
    
    return NextResponse.json(
      { error: errorData?.message || "Failed to disconnect account" },
      { status: response.status }
    );
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    );
  }
}
