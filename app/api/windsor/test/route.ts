import { queryWindsor, listLinkedAccounts, CONNECTORS } from "@/lib/windsor/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/windsor/test
 * Test endpoint to verify Windsor.ai API connection
 * No authentication required - for testing only
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "query";

  try {
    if (action === "accounts") {
      // List all connected accounts
      const accounts = await listLinkedAccounts();
      return NextResponse.json({
        success: true,
        action: "list_accounts",
        accounts,
        count: accounts.length,
      });
    }

    if (action === "query") {
      // Query all connected sources (same as your test URL)
      const connector = searchParams.get("connector") || CONNECTORS.ALL;
      const fields = searchParams.get("fields")?.split(",") || [
        "date",
        "datasource", 
        "account_name",
        "source",
        "clicks",
        "impressions",
        "spend",
      ];
      const datePreset = searchParams.get("date_preset") || "last_28d";

      const result = await queryWindsor({
        connector,
        fields,
        date_preset: datePreset,
      });

      return NextResponse.json({
        success: true,
        action: "query",
        connector,
        fields,
        date_preset: datePreset,
        rows: result.data,
        count: result.data.length,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Windsor test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
