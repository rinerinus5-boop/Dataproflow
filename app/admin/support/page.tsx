import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SupportTicketsClient from "./SupportTicketsClient";

export const metadata = {
  title: "Support Tickets",
  description: "Manage customer support tickets",
};

export default async function SupportTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch support tickets with conversation messages for summary
  const { data: tickets } = await supabase
    .from("support_tickets")
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        full_name
      ),
      support_conversations:conversation_id (
        id,
        support_messages (
          id,
          content,
          sender_type,
          created_at
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return <SupportTicketsClient tickets={tickets || []} />;
}
