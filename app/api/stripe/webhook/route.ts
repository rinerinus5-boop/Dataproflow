import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendSubscriptionConfirmationEmail } from "@/lib/email/email-service";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;
        const billingPeriod = session.metadata?.billing_period;

        if (userId && session.subscription) {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );

          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: stripeSubscription.id,
              plan: plan || "starter",
              status: "active",
              billing_period: billingPeriod || "monthly",
              current_period_start: new Date(
                (stripeSubscription as unknown as { current_period_start: number }).current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                (stripeSubscription as unknown as { current_period_end: number }).current_period_end * 1000
              ).toISOString(),
              trial_end: null,
            })
            .eq("user_id", userId);

          // Get user profile to send confirmation email
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", userId)
            .single();

          if (profile?.email) {
            try {
              await sendSubscriptionConfirmationEmail(
                profile.email,
                profile.full_name || "there",
                plan || "starter",
                billingPeriod || "monthly"
              );
            } catch (emailError) {
              console.error("Failed to send subscription confirmation email:", emailError);
            }
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const stripeSubUpdate = event.data.object as Stripe.Subscription;
        const customerId = stripeSubUpdate.customer as string;

        // Find user by Stripe customer ID
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          const subData = stripeSubUpdate as unknown as {
            status: string;
            current_period_start: number;
            current_period_end: number;
            cancel_at_period_end: boolean;
          };
          
          // Determine plan from metadata or price amount
          const plan = stripeSubUpdate.metadata?.plan || determinePlanFromAmount(stripeSubUpdate);
          const billingPeriod = stripeSubUpdate.metadata?.billing_period || 
            (stripeSubUpdate.items.data[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly");
          
          await supabase
            .from("subscriptions")
            .update({
              plan: plan,
              billing_period: billingPeriod,
              status: subData.status,
              current_period_start: new Date(
                subData.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subData.current_period_end * 1000
              ).toISOString(),
              cancel_at_period_end: subData.cancel_at_period_end,
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("user_id", sub.user_id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (sub) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", sub.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
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
