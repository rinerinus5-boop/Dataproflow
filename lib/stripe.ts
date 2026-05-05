import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export const PLANS = {
  starter: {
    name: "Starter",
    description: "Perfect for small businesses",
    priceMonthly: 10,
    priceAnnual: 100,
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID,
    features: [
      "1 data source account",
      "Basic analytics dashboard",
      "Email support",
      "7-day data history",
    ],
    accountLimit: 1,
  },
  professional: {
    name: "Professional",
    description: "For growing teams",
    priceMonthly: 25,
    priceAnnual: 250,
    stripePriceIdMonthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID,
    features: [
      "5 data source accounts",
      "Advanced analytics",
      "Priority support",
      "30-day data history",
      "Custom reports",
    ],
    accountLimit: 5,
  },
  enterprise: {
    name: "Enterprise",
    description: "For large organizations",
    priceMonthly: 50,
    priceAnnual: 500,
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    features: [
      "Unlimited data source accounts",
      "Full analytics suite",
      "Dedicated support",
      "Unlimited data history",
      "Custom integrations",
      "API access",
    ],
    accountLimit: -1, // unlimited
  },
} as const;

export type PlanType = keyof typeof PLANS;
