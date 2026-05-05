"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Crown,
  Zap,
  Building2,
  Loader2,
  Download,
  ExternalLink,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  billing_period: string;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
}

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals getting started",
    icon: Zap,
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      "1 connected account",
      "Basic analytics",
      "7-day data history",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing businesses and teams",
    icon: Crown,
    monthlyPrice: 79,
    annualPrice: 790,
    popular: true,
    features: [
      "5 connected accounts",
      "Advanced analytics",
      "30-day data history",
      "Priority support",
      "Custom reports",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    icon: Building2,
    monthlyPrice: 199,
    annualPrice: 1990,
    features: [
      "Unlimited accounts",
      "Full analytics suite",
      "Unlimited data history",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Team management",
    ],
  },
];

export default function PlansPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncSubscription = async () => {
      try {
        const res = await fetch("/api/stripe/sync-subscription", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setSyncMessage(`Successfully upgraded to ${data.subscription?.plan} plan!`);
          // Clear the success param from URL
          window.history.replaceState({}, "", "/dashboard/plans");
        }
      } catch (error) {
        console.error("Error syncing subscription:", error);
      }
    };

    const init = async () => {
      await fetchSubscription();
      await fetchInvoices();
      
      // If redirected from successful checkout, sync subscription from Stripe
      if (searchParams.get("success") === "true") {
        await syncSubscription();
        // Refresh after sync
        await fetchSubscription();
        await fetchInvoices();
      }
    };
    init();
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
        if (data.subscription?.billing_period) {
          setBillingPeriod(data.subscription.billing_period);
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/stripe/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setActionLoading(planId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billingPeriod }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading("portal");
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      trialing: "bg-blue-100 text-blue-700",
      canceled: "bg-gray-100 text-gray-700",
      past_due: "bg-red-100 text-red-700",
      paid: "bg-green-100 text-green-700",
      open: "bg-yellow-100 text-yellow-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for current plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        {/* Skeleton for plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {syncMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{syncMessage}</span>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-gray-900 capitalize">
                  {subscription?.plan || "Starter"} Plan
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription?.status || "trialing")}`}>
                  {subscription?.status === "trialing" ? "Trial" : subscription?.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {subscription?.status === "trialing"
                    ? `Trial ends ${formatDate(subscription?.trial_end ?? null)}`
                    : `Renews ${formatDate(subscription?.current_period_end ?? null)}`}
                </span>
                <span className="capitalize">{subscription?.billing_period || "monthly"} billing</span>
              </div>
              {subscription?.cancel_at_period_end && (
                <p className="text-sm text-red-600 mt-2">
                  Your subscription will be canceled at the end of the billing period.
                </p>
              )}
            </div>
            <button
              onClick={handleManageBilling}
              disabled={actionLoading === "portal" || !subscription?.stripe_customer_id}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading === "portal" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm font-medium transition-colors ${billingPeriod === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
          Monthly
        </span>
        <button
          type="button"
          onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
          className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors ${
            billingPeriod === "annual" ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
              billingPeriod === "annual" ? "left-8" : "left-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium transition-colors ${billingPeriod === "annual" ? "text-gray-900" : "text-gray-500"}`}>
          Annual
        </span>
        <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
          Save 17%
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscription?.plan === plan.id;
          const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-xl border-2 p-6 transition-all ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10"
                  : isCurrentPlan
                  ? "border-green-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                  Current Plan
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                plan.popular ? "bg-primary/10" : "bg-gray-100"
              }`}>
                <Icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-gray-600"}`} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${price}</span>
                <span className="text-gray-500">/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                disabled={isCurrentPlan || actionLoading === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isCurrentPlan
                    ? "bg-green-100 text-green-700"
                    : plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {actionLoading === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isCurrentPlan ? (
                  <>
                    <Check className="w-5 h-5" />
                    Current Plan
                  </>
                ) : (
                  "Upgrade"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
          </div>
        </div>

        {invoicesLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Invoice {invoice.number || invoice.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.created * 1000).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(invoice.amount_paid, invoice.currency)}
                  </span>
                  <div className="flex items-center gap-2">
                    {invoice.hosted_invoice_url && (
                      <a
                        href={invoice.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        title="View Invoice"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-gray-500">
              Your billing history will appear here after your first payment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
