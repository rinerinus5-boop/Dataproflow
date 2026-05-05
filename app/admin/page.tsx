import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./components/AdminDashboardClient";
import Stripe from "stripe";

export const metadata = {
  title: "Admin Dashboard",
  description: "DataProFlow Admin Dashboard - Manage users and subscriptions.",
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch all users with their subscriptions
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      subscriptions (*)
    `)
    .order("created_at", { ascending: false });

  // Get stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: activeSubscriptions } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const { count: trialUsers } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "trialing");

  const { count: inactiveUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_active", false);

  // Fetch transactions from Stripe
  let transactions: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    customer_email: string;
    customer_name: string | null;
    description: string | null;
  }> = [];
  
  let totalRevenue = 0;

  try {
    const charges = await stripe.charges.list({ limit: 100 });
    transactions = charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      created: charge.created,
      customer_email: charge.billing_details?.email || "",
      customer_name: charge.billing_details?.name || null,
      description: charge.description,
    }));
    
    totalRevenue = charges.data
      .filter((c) => c.status === "succeeded")
      .reduce((sum, c) => sum + c.amount, 0);
  } catch (error) {
    console.error("Error fetching Stripe transactions:", error);
  }

  return (
    <AdminDashboardClient
      users={users || []}
      transactions={transactions}
      stats={{
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        trialUsers: trialUsers || 0,
        totalRevenue,
        inactiveUsers: inactiveUsers || 0,
      }}
    />
  );
}
