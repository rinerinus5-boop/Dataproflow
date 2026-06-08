import { createClient } from "@/lib/supabase/server";
import ConnectionsClient from "./ConnectionsClient";

export const metadata = {
  title: "Connections | DataProFlow",
  description: "Manage your connected data sources.",
};

// Revalidate every 10 seconds to catch new connections after OAuth
export const revalidate = 10;

export default async function ConnectionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8">
        <p>Please log in to manage connections.</p>
      </div>
    );
  }

  // Fetch user's own connections from OUR database (not Windsor's team API)
  // This ensures each user only sees THEIR connections
  const { data: userConnections, error: connectionsError } = await supabase
    .from("connected_accounts")
    .select("id, platform, platform_username, created_at")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (connectionsError) {
    console.error("Failed to fetch user connections:", connectionsError);
  }

  const connectedAccounts = (userConnections || []).map((conn) => ({
    id: conn.id,
    platform: conn.platform,
    platform_username: conn.platform_username,
    created_at: conn.created_at,
  }));

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  return (
    <ConnectionsClient
      connectedAccounts={connectedAccounts}
      subscription={subscription}
    />
  );
}
