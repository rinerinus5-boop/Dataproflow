import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import UserDetailClient from "./UserDetailClient";

export const metadata = {
  title: "User Details | Admin Dashboard",
  description: "View user details and connected platforms.",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const adminSupabase = createAdminClient();

  // Fetch user with subscription
  const { data: user, error } = await adminSupabase
    .from("profiles")
    .select(`
      *,
      subscriptions (*)
    `)
    .eq("id", userId)
    .single();

  if (error || !user) {
    notFound();
  }

  // Fetch user's connected accounts
  const { data: connections } = await adminSupabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <UserDetailClient user={user} connections={connections || []} />;
}
