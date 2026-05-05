"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import ScrollReveal from "../ui/ScrollReveal";

const plans = [
  {
    name: "Starter",
    connectors: "1 Connector",
    price: "$10",
    period: "/month",
    perConnector: "$10.00/connector",
    description: "Base price - Perfect for getting started",
    features: [
      "1 Data Connector",
      "Basic Dashboard",
      "7-day data history",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    connectors: "4 Connectors",
    price: "$28",
    period: "/month",
    perConnector: "$7.00/connector",
    description: "Sweet spot - Big discount per connector",
    features: [
      "4 Data Connectors",
      "Advanced Dashboard",
      "30-day data history",
      "Priority support",
      "Custom reports",
      "API access",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Scale",
    connectors: "6 Connectors",
    price: "$36",
    period: "/month",
    perConnector: "$6.00/connector",
    description: "Best value - Same cheap rate as you grow",
    features: [
      "6 Data Connectors",
      "Advanced Dashboard",
      "Unlimited data history",
      "24/7 dedicated support",
      "Custom integrations",
      "Team collaboration",
      "Advanced analytics",
    ],
    cta: "Get Started",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-white">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Choose the right Pricing Plan
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="mt-6 text-lg text-muted-foreground">
              Simple, transparent pricing that grows with you. Start free, upgrade when you need.
            </p>
          </ScrollReveal>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={150 + index * 100}>
              <div
                className={`relative h-full rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "bg-foreground text-white shadow-2xl shadow-foreground/20 scale-105"
                    : "bg-white border border-border hover:shadow-xl hover:shadow-primary/5"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3
                    className={`text-xl font-semibold ${
                      plan.popular ? "text-white" : "text-foreground"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`mt-1 text-sm font-medium ${
                      plan.popular ? "text-primary" : "text-primary"
                    }`}
                  >
                    {plan.connectors}
                  </p>
                  <div className="mt-4 flex items-baseline justify-center gap-1">
                    <span
                      className={`text-5xl font-bold ${
                        plan.popular ? "text-white" : "text-foreground"
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={
                        plan.popular ? "text-white/70" : "text-muted-foreground"
                      }
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      plan.popular ? "text-white/80" : "text-muted-foreground"
                    }`}
                  >
                    {plan.perConnector}
                  </p>
                  <p
                    className={`mt-3 text-sm ${
                      plan.popular ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "bg-primary" : "bg-primary/10"
                        }`}
                      >
                        <Check
                          className={`w-3 h-3 ${
                            plan.popular ? "text-white" : "text-primary"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-sm ${
                          plan.popular ? "text-white/90" : "text-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className={`block w-full text-center px-6 py-3 rounded-full font-medium transition-all duration-200 cursor-pointer ${
                      plan.popular
                        ? "bg-white text-foreground hover:bg-white/90"
                        : "bg-foreground text-white hover:bg-foreground/90"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
