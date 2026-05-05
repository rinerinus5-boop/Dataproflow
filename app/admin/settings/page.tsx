import { createClient } from "@/lib/supabase/server";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata = {
  title: "Settings | Admin Dashboard",
  description: "Admin settings for DataProFlow.",
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Get current admin user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get platform stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalConnections } = await supabase
    .from("connected_accounts")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <AdminSettingsClient
      profile={profile}
      stats={{
        totalUsers: totalUsers || 0,
        totalConnections: totalConnections || 0,
      }}
    />
  );
}
