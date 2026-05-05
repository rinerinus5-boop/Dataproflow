import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardLayout from "./components/DashboardLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles auth redirects, but we still need user data for the layout
  if (!user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch subscription
  let { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // If subscription doesn't exist or is missing trial data, create/fix it
  if (!subscription) {
    const adminClient = createAdminClient();
    // Calculate trial end date (14 days from now)
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const trialEnd = trialEndDate.toISOString();
    
    await adminClient
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan: "starter",
        status: "trialing",
        billing_period: "monthly",
        trial_end: trialEnd,
      });
    
    // Re-fetch subscription
    const { data: newSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    subscription = newSub;
  } else if (subscription.status === "trialing" && !subscription.trial_end) {
    // Fix missing trial_end for existing trialing subscriptions
    const adminClient = createAdminClient();
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const trialEnd = trialEndDate.toISOString();
    
    await adminClient
      .from("subscriptions")
      .update({ trial_end: trialEnd })
      .eq("user_id", user.id);
    
    subscription.trial_end = trialEnd;
  }

  return (
    <DashboardLayout user={user} profile={profile} subscription={subscription}>
      {children}
    </DashboardLayout>
  );
}
