import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

// Price configuration - map plan names to prices in cents
const PLAN_PRICES = {
  starter: {
    monthly: 2900, // $29/month
    annual: 29000, // $290/year
  },
  professional: {
    monthly: 7900, // $79/month
    annual: 79000, // $790/year
  },
  enterprise: {
    monthly: 19900, // $199/month
    annual: 199000, // $1990/year
  },
};

export async function POST(request: Request) {
  try {
    const { plan, billingPeriod } = await request.json();

    if (!plan || !billingPeriod) {
      return NextResponse.json(
        { error: "Plan and billing period are required" },
        { status: 400 }
      );
    }

    const planConfig = PLAN_PRICES[plan as keyof typeof PLAN_PRICES];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update subscription with customer ID
      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    // Get price amount based on billing period
    const priceAmount = billingPeriod === "annual" ? planConfig.annual : planConfig.monthly;
    const interval = billingPeriod === "annual" ? "year" : "month";

    // Create checkout session with price_data (no need for pre-created Stripe prices)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `DataProFlow ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
              description: `${billingPeriod === "annual" ? "Annual" : "Monthly"} subscription`,
            },
            unit_amount: priceAmount,
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/plans?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
        billing_period: billingPeriod,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan,
          billing_period: billingPeriod,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
