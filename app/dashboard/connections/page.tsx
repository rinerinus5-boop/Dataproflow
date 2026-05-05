import { createClient } from "@/lib/supabase/server";
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

  const { data: connectedAccounts } = await supabase
    .from("connected_accounts")
    .select("id, platform, platform_username, created_at")
    .eq("user_id", user?.id)
    .eq("is_active", true);

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user?.id)
    .single();

  return (
    <ConnectionsClient
      connectedAccounts={connectedAccounts || []}
      subscription={subscription}
    />
  );
}
