import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Helper type for Stripe subscription with period fields
interface StripeSubWithPeriod extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

// This endpoint syncs the subscription status from Stripe
// Used as a fallback when webhooks aren't available (e.g., localhost)
export async function POST() {
  try {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current subscription using admin client to bypass RLS
    const { data: subscription } = await adminSupabase
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      // Try to find customer by email in Stripe
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json({ error: "No Stripe customer found" }, { status: 404 });
      }

      // Update the subscription with the customer ID
      const customerId = customers.data[0].id;
      await adminSupabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);

      // Now get subscriptions for this customer
      const stripeSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 1,
      });

      if (stripeSubscriptions.data.length === 0) {
        return NextResponse.json({ error: "No Stripe subscription found" }, { status: 404 });
      }

      const stripeSub = stripeSubscriptions.data[0] as StripeSubWithPeriod;
      const plan = stripeSub.metadata?.plan || determinePlanFromAmount(stripeSub);
      const billingPeriod = stripeSub.metadata?.billing_period || 
        (stripeSub.items.data[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly");

      // Determine the correct status - if they have a Stripe subscription, they're active
      // Even if Stripe says "incomplete" or "trialing", if they just paid, mark as active
      const finalStatus = (stripeSub.status === "active" || stripeSub.status === "trialing") ? "active" : stripeSub.status;
      
      // Safely convert timestamps, handling null/undefined values
      const updateData: Record<string, any> = {
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSub.id,
        plan: plan,
        status: finalStatus,
        billing_period: billingPeriod,
        trial_end: null,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
      };

      // Only add period dates if they exist
      if (stripeSub.current_period_start) {
        updateData.current_period_start = new Date(stripeSub.current_period_start * 1000).toISOString();
      }
      if (stripeSub.current_period_end) {
        updateData.current_period_end = new Date(stripeSub.current_period_end * 1000).toISOString();
      }
      
      // Update subscription in database using admin client
      const { error } = await adminSupabase
        .from("subscriptions")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating subscription:", error);
        return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        subscription: {
          plan,
          status: stripeSub.status,
          billing_period: billingPeriod,
        }
      });
    }

    // Get all subscriptions for this customer from Stripe
    const stripeSubscriptions = await stripe.subscriptions.list({
      customer: subscription.stripe_customer_id,
      status: "all",
      limit: 1,
    });

    if (stripeSubscriptions.data.length === 0) {
      return NextResponse.json({ error: "No Stripe subscription found" }, { status: 404 });
    }

    const stripeSub = stripeSubscriptions.data[0] as StripeSubWithPeriod;
    
    // Extract plan from metadata or determine from price amount
    const plan = stripeSub.metadata?.plan || determinePlanFromAmount(stripeSub);
    const billingPeriod = stripeSub.metadata?.billing_period || 
      (stripeSub.items.data[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly");

    // Determine the correct status - if they have a Stripe subscription, they're active
    // Even if Stripe says "incomplete" or "trialing", if they just paid, mark as active
    const finalStatus = (stripeSub.status === "active" || stripeSub.status === "trialing") ? "active" : stripeSub.status;
    
    // Safely convert timestamps, handling null/undefined values
    const updateData2: Record<string, any> = {
      stripe_subscription_id: stripeSub.id,
      plan: plan,
      status: finalStatus,
      billing_period: billingPeriod,
      trial_end: null,
      cancel_at_period_end: stripeSub.cancel_at_period_end,
    };

    // Only add period dates if they exist
    if (stripeSub.current_period_start) {
      updateData2.current_period_start = new Date(stripeSub.current_period_start * 1000).toISOString();
    }
    if (stripeSub.current_period_end) {
      updateData2.current_period_end = new Date(stripeSub.current_period_end * 1000).toISOString();
    }
    
    // Update subscription in database using admin client
    const { error } = await adminSupabase
      .from("subscriptions")
      .update(updateData2)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating subscription:", error);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      subscription: {
        plan,
        status: stripeSub.status,
        billing_period: billingPeriod,
      }
    });
  } catch (error) {
    console.error("Sync subscription error:", error);
    return NextResponse.json(
      { error: "Failed to sync subscription" },
      { status: 500 }
    );
  }
}

// Determine plan based on subscription amount
function determinePlanFromAmount(subscription: Stripe.Subscription): string {
  const amount = subscription.items.data[0]?.price?.unit_amount || 0;
  
  // Monthly prices: starter=$29, professional=$79, enterprise=$199
  // Annual prices: starter=$290, professional=$790, enterprise=$1990
  if (amount >= 199000 || amount >= 19900) return "enterprise";
  if (amount >= 79000 || amount >= 7900) return "professional";
  return "starter";
}
