import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// This endpoint creates the initial admin user
// It should only work once and requires a secret key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, secretKey } = body;

    // Verify secret key (use env variable in production)
    const ADMIN_SECRET = process.env.ADMIN_SETUP_SECRET || "dataflow-admin-setup-2024";
    
    if (secretKey !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 403 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Check if admin already exists
    const { data: existingAdmin } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin user already exists" },
        { status: 400 }
      );
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Update the profile to set role as admin
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .update({
        role: "admin",
        full_name: "Admin",
        email_verified: true,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Profile error:", profileError);
      // Try to clean up the auth user
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // Create a subscription for the admin (enterprise plan)
    const { error: subError } = await adminSupabase.from("subscriptions").insert({
      user_id: authData.user.id,
      plan: "enterprise",
      status: "active",
      billing_period: "yearly",
    });

    if (subError) {
      console.error("Subscription error:", subError);
    }

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
