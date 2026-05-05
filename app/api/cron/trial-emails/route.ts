import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialCheckInEmail, sendTrialEndingEmail } from "@/lib/email/email-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date();

    // Get all trialing subscriptions
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        user_id,
        trial_end,
        status,
        profiles!inner(email, full_name)
      `)
      .eq("status", "trialing")
      .not("trial_end", "is", null);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No trialing subscriptions found" });
    }

    let checkInEmailsSent = 0;
    let endingEmailsSent = 0;

    for (const sub of subscriptions) {
      const trialEnd = new Date(sub.trial_end);
      const daysUntilEnd = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceStart = 14 - daysUntilEnd; // Assuming 14-day trial

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profiles = (sub as any).profiles;
      if (!profiles || !profiles.email) continue;
      
      const profile = profiles as { email: string; full_name: string | null };

      try {
        // Send check-in email on day 6 or 7
        if (daysSinceStart >= 6 && daysSinceStart <= 7) {
          // Check if we already sent this email
          const { data: existingLog } = await supabase
            .from("email_logs")
            .select("id")
            .eq("user_id", sub.user_id)
            .eq("email_type", "trial_checkin")
            .single();

          if (!existingLog) {
            await sendTrialCheckInEmail(profile.email, profile.full_name || "there");
            
            // Log the email
            await supabase.from("email_logs").insert({
              user_id: sub.user_id,
              email_type: "trial_checkin",
              sent_at: now.toISOString(),
            });

            checkInEmailsSent++;
          }
        }

        // Send ending email 2-3 days before trial ends
        if (daysUntilEnd >= 2 && daysUntilEnd <= 3) {
          // Check if we already sent this email
          const { data: existingLog } = await supabase
            .from("email_logs")
            .select("id")
            .eq("user_id", sub.user_id)
            .eq("email_type", "trial_ending")
            .single();

          if (!existingLog) {
            await sendTrialEndingEmail(profile.email, profile.full_name || "there", daysUntilEnd);
            
            // Log the email
            await supabase.from("email_logs").insert({
              user_id: sub.user_id,
              email_type: "trial_ending",
              sent_at: now.toISOString(),
            });

            endingEmailsSent++;
          }
        }
      } catch (emailError) {
        console.error(`Failed to send trial email to ${profile.email}:`, emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${subscriptions.length} trialing subscriptions`,
      checkInEmailsSent,
      endingEmailsSent,
    });
  } catch (error) {
    console.error("Trial emails cron error:", error);
    return NextResponse.json(
      { error: "Failed to process trial emails" },
      { status: 500 }
    );
  }
}
