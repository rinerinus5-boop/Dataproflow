import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings | DataProFlow",
  description: "Manage your account settings and preferences.",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <SettingsClient
      user={{ id: user?.id || "", email: user?.email || "" }}
      profile={profile}
      subscription={subscription}
    />
  );
}
