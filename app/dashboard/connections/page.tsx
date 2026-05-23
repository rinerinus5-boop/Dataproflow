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
    console.log("Windsor linked accounts:", JSON.stringify(linkedAccounts, null, 2));
    
    windsorAccounts = linkedAccounts.map((acc) => {
      // Map Windsor ds_id to platform name
      let platform = "unknown";
      const dsId = acc.ds_id?.toLowerCase() || "";
      
      if (dsId.includes("facebook")) platform = "facebook";
      else if (dsId.includes("instagram")) platform = "instagram";
      else if (dsId.includes("tiktok")) platform = "tiktok";
      else if (dsId.includes("google_ads")) platform = "google_ads";
      else if (dsId.includes("google_analytics")) platform = "google_analytics";
      else if (dsId.includes("linkedin")) platform = "linkedin";
      else if (dsId.includes("twitter")) platform = "twitter";
      else if (dsId.includes("snapchat")) platform = "snapchat";
      else if (dsId.includes("pinterest")) platform = "pinterest";
      else if (dsId) platform = dsId.replace("_ads", "");
      
      return {
        id: acc.id || acc.ds_id || crypto.randomUUID(),
        platform,
        platform_username: acc.name || acc.co_user_member_name || null,
        created_at: acc.created_at || new Date().toISOString(),
      };
    });
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
