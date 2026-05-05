import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendWelcomeEmail, sendAdminNotificationEmail } from "@/lib/email/email-service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Use admin client to bypass RLS and ensure profile is updated
        const adminClient = createAdminClient();
        
        // Check if profile exists
        const { data: existingProfile } = await adminClient
          .from("profiles")
          .select("id, full_name")
          .eq("id", user.id)
          .single();
        
        const fullNameFromMeta = user.user_metadata?.full_name as string | undefined;
        
        if (existingProfile) {
          // Update existing profile with email_verified and full_name from user metadata
          await adminClient
            .from("profiles")
            .update({ 
              email_verified: true,
              full_name: fullNameFromMeta || existingProfile.full_name || null
            })
            .eq("id", user.id);
        } else {
          // Create profile if it doesn't exist (shouldn't happen but safety net)
          // This is a new user from OAuth (Google, etc.)
          await adminClient
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || "",
              full_name: fullNameFromMeta || "",
              email_verified: true
            });
          
          // Also create subscription if missing
          const { data: existingSub } = await adminClient
            .from("subscriptions")
            .select("id")
            .eq("user_id", user.id)
            .single();
          
          if (!existingSub) {
            await adminClient
              .from("subscriptions")
              .insert({
                user_id: user.id,
                plan: "starter",
                status: "trialing",
                trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
              });
          }
          
          // Send welcome email for new OAuth users
          if (user.email && fullNameFromMeta) {
            try {
              await sendWelcomeEmail(user.email, fullNameFromMeta);
              await sendAdminNotificationEmail(user.email, fullNameFromMeta, 'OAuth (Google)');
            } catch (emailError) {
              console.error('Failed to send welcome/admin email:', emailError);
            }
          }
        }
      }
      
      // Redirect to verification success page for email confirmations
      if (type === "signup" || type === "email") {
        return NextResponse.redirect(`${origin}/auth/verify-success?next=${encodeURIComponent(next)}`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
