import { createClient } from "@/lib/supabase/server";
import { listLinkedAccounts } from "@/lib/windsor/client";
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

  // Fetch Windsor.ai connected accounts
  let windsorAccounts: { id: string; platform: string; platform_username: string | null; created_at: string }[] = [];
  try {
    const linkedAccounts = await listLinkedAccounts();
    // Log full response for debugging
    console.log("Windsor linked accounts raw:", JSON.stringify(linkedAccounts, null, 2));
    
    windsorAccounts = linkedAccounts.map((acc) => {
      // Map Windsor ds_id to platform name
      // ds_id examples: "facebook", "facebook_ads", "instagram", "instagram_insights", "tiktok", "tiktok_ads", etc.
      let platform = "unknown";
      const dsId = (acc.ds_id || "").toLowerCase().trim();
      
      // Enhanced platform detection - check for exact matches first
      if (dsId === "facebook" || dsId === "facebook_ads" || dsId === "facebookads" || dsId === "fb") {
        platform = "facebook";
      } else if (dsId === "instagram" || dsId === "instagram_insights" || dsId === "instagram_basic" || dsId === "ig") {
        platform = "instagram";
      } else if (dsId === "tiktok" || dsId === "tiktok_ads" || dsId === "tiktokads" || dsId === "tiktok_business") {
        platform = "tiktok";
      } else if (dsId.includes("facebook")) {
        platform = "facebook";
      } else if (dsId.includes("instagram")) {
        platform = "instagram";
      } else if (dsId.includes("tiktok")) {
        platform = "tiktok";
      } else if (dsId.includes("google_ads") || dsId.includes("googleads") || dsId.includes("adwords")) {
        platform = "google_ads";
      } else if (dsId.includes("google_analytics") || dsId.includes("ga4")) {
        platform = "google_analytics";
      } else if (dsId.includes("linkedin")) {
        platform = "linkedin";
      } else if (dsId.includes("twitter") || dsId.includes("x_ads") || dsId.includes("xads")) {
        platform = "twitter";
      } else if (dsId.includes("snapchat")) {
        platform = "snapchat";
      } else if (dsId.includes("pinterest")) {
        platform = "pinterest";
      } else if (dsId.includes("youtube")) {
        platform = "youtube";
      }
      
      // Get the best available name for the account
      const accountName = String(acc.account_name || acc.name || acc.co_user_member_name || acc.user_name || "");
      const displayName = accountName.length > 0 ? accountName : null;
      
      // Generate a unique ID if none provided
      const uniqueId = acc.id || acc.account_id || `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        id: uniqueId,
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
