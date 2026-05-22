import { createAdminClient } from "@/lib/supabase/admin";
import { sendWaitlistConfirmationEmail } from "@/lib/email/email-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = createAdminClient();

    // Check if email already exists
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already on the waitlist" },
        { status: 409 }
      );
    }

    // Insert new waitlist entry
    const { error } = await supabase.from("waitlist").insert({
      email: normalizedEmail,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendWaitlistConfirmationEmail(normalizedEmail);
      console.log(`Waitlist confirmation email sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Failed to send waitlist email:", emailError);
      // Don't fail the request if email fails - user is still on the list
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
