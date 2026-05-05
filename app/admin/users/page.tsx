import { createAdminClient } from "@/lib/supabase/admin";
import UsersClient from "./UsersClient";

export const metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage all users in DataProFlow.",
};

export default async function UsersPage() {
  const adminSupabase = createAdminClient();

  // Fetch all users with their subscriptions using admin client to bypass RLS
  const { data: users, error: usersError } = await adminSupabase
    .from("profiles")
    .select(`
      *,
      subscriptions (*)
    `)
    .order("created_at", { ascending: false });

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

  // Fetch connections count for each user using admin client
  const { data: connections } = await adminSupabase
    .from("connected_accounts")
    .select("user_id")
    .eq("is_active", true);

  // Create a map of user_id to connection count
  const connectionCounts: Record<string, number> = {};
  connections?.forEach((conn) => {
    connectionCounts[conn.user_id] = (connectionCounts[conn.user_id] || 0) + 1;
  });

  // Add connection count to each user
  const usersWithConnections = users?.map((user) => ({
    ...user,
    connections_count: connectionCounts[user.id] || 0,
  })) || [];

  return <UsersClient users={usersWithConnections} />;
}
