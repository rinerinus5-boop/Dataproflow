import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: templates, error } = await supabase
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
