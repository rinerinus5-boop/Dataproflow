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
    // Log full response for debugging
    console.log("Windsor linked accounts raw:", JSON.stringify(linkedAccounts, null, 2));
    
    windsorAccounts = linkedAccounts.map((acc) => {
      // Map Windsor ds_id to platform name
      // ds_id examples: "facebook_ads", "instagram", "tiktok_ads", etc.
      let platform = "unknown";
      const dsId = (acc.ds_id || "").toLowerCase();
      
      // Check for specific platforms
      if (dsId.includes("facebook")) platform = "facebook";
      else if (dsId.includes("instagram")) platform = "instagram";
      else if (dsId.includes("tiktok")) platform = "tiktok";
      else if (dsId.includes("google_ads") || dsId.includes("googleads")) platform = "google_ads";
      else if (dsId.includes("google_analytics") || dsId.includes("ga4")) platform = "google_analytics";
      else if (dsId.includes("linkedin")) platform = "linkedin";
      else if (dsId.includes("twitter") || dsId.includes("x_ads")) platform = "twitter";
      else if (dsId.includes("snapchat")) platform = "snapchat";
      else if (dsId.includes("pinterest")) platform = "pinterest";
      else if (dsId.includes("youtube")) platform = "youtube";
      else if (dsId) platform = dsId.replace(/_ads$/i, "").replace(/_/g, " ");
      
      // Get the best available name for the account
      const accountName = acc.account_name || acc.name || acc.co_user_member_name || null;
      
      return {
        id: acc.id || acc.account_id || dsId || "unknown",
        platform,
        platform_username: accountName,
        created_at: acc.created_at || new Date().toISOString(),
      };
    });
    
    console.log("Mapped Windsor accounts:", JSON.stringify(windsorAccounts, null, 2));
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
