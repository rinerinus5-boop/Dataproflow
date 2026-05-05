import { createClient } from "@/lib/supabase/server";
import AdminLayout from "./components/AdminLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles auth redirects, but we still need user data for the layout
  if (!user) {
    return null;
  }

  // Fetch user profile for display
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <AdminLayout user={user} profile={profile}>
      {children}
    </AdminLayout>
  );
}
