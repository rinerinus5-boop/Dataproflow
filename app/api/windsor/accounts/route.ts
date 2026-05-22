import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windsor/accounts?source=facebook
 * Lists all co-user linked accounts for a given data source (or all sources).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = request.nextUrl.searchParams.get("source") ?? undefined;
    const accessToken = request.nextUrl.searchParams.get("access_token") ?? undefined;

    const accounts = await listLinkedAccounts(source, accessToken);

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Windsor accounts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list accounts" },
      { status: 500 }
    );
  }
}
