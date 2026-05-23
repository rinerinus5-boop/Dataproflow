import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
import ConnectionsClient from "./ConnectionsClient";

export const metadata = {
  title: "Connections | DataProFlow",
  description: "Manage your connected data sources.",
};

export default async function ConnectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch Windsor.ai connected accounts
  let windsorAccounts: { id: string; platform: string; platform_username: string | null; created_at: string }[] = [];
  try {
    const linkedAccounts = await listLinkedAccounts();
    windsorAccounts = linkedAccounts.map((acc) => ({
      id: acc.id || acc.ds_id,
      platform: acc.ds_id?.replace("_ads", "") || "unknown",
      platform_username: acc.name || acc.co_user_member_name || null,
      created_at: acc.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch Windsor accounts:", error);
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user?.id)
    .single();

  return (
    <ConnectionsClient
      connectedAccounts={windsorAccounts}
      subscription={subscription}
    />
  );
}
