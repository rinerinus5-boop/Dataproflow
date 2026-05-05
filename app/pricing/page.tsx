"use client";

import { useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/ui/Breadcrumb";

const MetaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
  </svg>
);

const GA4Icon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.84 2.998v17.958c0 .554-.45 1.004-1.004 1.004H14.87a1.004 1.004 0 01-1.004-1.004v-4.49a1.004 1.004 0 011.004-1.003h2.99V9.49h-2.99a1.004 1.004 0 01-1.004-1.004V2.998c0-.554.45-1.004 1.004-1.004h6.966c.554 0 1.004.45 1.004 1.004z" fill="#F9AB00"/>
    <path d="M10.13 21.96H3.164a1.004 1.004 0 01-1.004-1.004V8.486c0-.554.45-1.004 1.004-1.004h6.966c.554 0 1.004.45 1.004 1.004v12.47c0 .554-.45 1.004-1.004 1.004z" fill="#E37400"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ShopifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#96BF48">
    <path d="M15.337 3.415c-.022-.165-.187-.247-.312-.26-.124-.014-2.739-.165-2.739-.165s-1.817-1.806-2.008-1.997c-.19-.19-.562-.134-.707-.09-.02.006-.382.118-.975.302-.58-1.674-1.604-3.21-3.406-3.21-.05 0-.1.002-.15.005C4.57-2.293 3.96-2 3.443-2c-2.633 0-3.89 3.293-4.285 4.967-.998.31-1.71.53-1.8.558-.56.176-.577.194-.65.72C-3.36 4.7-5 17.986-5 17.986L10.847 21l6.836-1.476S15.36 3.58 15.337 3.415z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#4285F4">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const dataSourceTypes = [
  { name: "Ad Account", icon: MetaIcon },
  { name: "Property", icon: GA4Icon },
  { name: "Business Profile", icon: GoogleIcon },
  { name: "Store", icon: ShopifyIcon },
  { name: "Account", icon: TikTokIcon },
  { name: "10 Locations", icon: LocationIcon },
];

const LookerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <circle cx="12" cy="12" r="10" fill="#4285F4"/>
    <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);

const SheetsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#0F9D58"/>
    <path d="M14 2v6h6" fill="#87CEAC"/>
    <path d="M8 13h8v1H8zm0 2h8v1H8zm0 2h5v1H8z" fill="white"/>
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A"/>
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0"/>
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D"/>
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E"/>
  </svg>
);

const ZapierIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4l2.5 6H20l-4.5 3.5L17 20l-5-3.5L7 20l1.5-6.5L4 10h5.5L12 4z" fill="#FF4A00"/>
  </svg>
);

const destinations = [
  { name: "Looker Studio", icon: LookerIcon },
  { name: "Google Sheets", icon: SheetsIcon },
  { name: "Slack", icon: SlackIcon },
  { name: "Zapier", icon: ZapierIcon },
];

const pricingTiers = [
  { accounts: 1, price: 28, perAccount: 28, tier: 'Basic' },
  { accounts: 2, price: 50, perAccount: 25, tier: 'Basic' },
  { accounts: 3, price: 65, perAccount: 21.67, tier: 'Basic' },
  { accounts: 4, price: 79, perAccount: 19.75, tier: 'Pro' },
  { accounts: 5, price: 89, perAccount: 17.8, tier: 'Pro' },
  { accounts: 6, price: 99, perAccount: 16.5, tier: 'Premium' },
  { accounts: 7, price: 109, perAccount: 15.57, tier: 'Premium' },
  { accounts: 8, price: 119, perAccount: 14.88, tier: 'Premium' },
  { accounts: 9, price: 129, perAccount: 14.33, tier: 'Premium' },
  { accounts: 10, price: 139, perAccount: 13.9, tier: 'Premium' },
];

const faqs = [
  {
    question: "How is DataProFlow's pricing unique?",
    answer:
      "Pay only for what you use: You're charged only for the exact number of accounts you connect. Other tools bundle accounts into fixed tiers, leading to wasted capacity. Flexible upgrades: Data blending is a no-code, self-service add-on. Simple and predictable: We charge per account. Start free, grow gradually: Begin with a 14-day free trial.",
  },
  {
    question: "Can you give an example of pricing?",
    answer:
      "Let's say you only need to connect 1 Instagram account. That's $28/mo (Basic tier). If you need to connect 4 accounts (2 Instagram, 1 Facebook, 1 TikTok), that's $79/mo (Pro tier). For 6 accounts, you get the Premium tier at $99/mo. The more accounts you connect, the less you pay on average per account.",
  },
  {
    question: "Do I need data blending?",
    answer:
      "If you need to build a dashboard with multiple sources, we suggest enabling data blending. It speeds up setup and unlocks cross-channel and ROI reporting. Connect platforms like Instagram, Facebook, TikTok, Google Ads, and LinkedIn Ads in one connection.",
  },
  {
    question: "Can I connect multiple sources without using blendable accounts?",
    answer:
      "You can connect each data source separately and still create multi-channel reports. However, we recommend upgrading to data blending when you need to combine data across channels, your reports start slowing down, or managing too many separate connections becomes messy.",
  },
  {
    question: "How does data blending pricing work?",
    answer:
      "Data blending is an optional add-on you can enable on specific accounts. When enabled, those accounts cost 3× the regular price per account/mo. You choose which accounts to blend—enable it only where you need to combine sources.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We refund for requests made within the first 14 days after purchases. We may re-evaluate exceptional cases. Contact our support team if you have any questions.",
  },
];

export default function PricingPage() {
  const [accountCount, setAccountCount] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const currentTier = pricingTiers.find((t) => t.accounts === accountCount) || pricingTiers[0];
  const monthlyPrice = currentTier.price;
  const annualPrice = Math.round(monthlyPrice * 0.8 * 10) / 10;
  const displayPrice = billingPeriod === "annual" ? annualPrice : monthlyPrice;

  const incrementAccounts = () => {
    if (accountCount < 10) setAccountCount(accountCount + 1);
  };

  const decrementAccounts = () => {
    if (accountCount > 1) setAccountCount(accountCount - 1);
  };

  return (
    <>
      <Header />
      <main className="pt-20 animate-fade-in">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={[{ label: "Pricing" }]} />
        </div>

        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-secondary/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              Start free. <span className="text-primary">Pay per data source account.</span>
            </h1>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <span className="text-sm text-muted-foreground">A data source account means</span>
              {dataSourceTypes.map((type) => (
                <div
                  key={type.name}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-border text-sm"
                >
                  <type.icon />
                  <span className="text-foreground">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Calculator Section */}
        <section className="py-12 md:py-16 bg-secondary/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left - Calculator (3 cols) */}
              <div className="lg:col-span-3 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
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
                  <span
                    className={`text-sm font-medium transition-colors ${
                      billingPeriod === "annual" ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Annual
                  </span>
                  <span className="bg-primary text-white text-xs px-2.5 py-1 rounded-full font-medium">
                    Save 17%
                  </span>
                </div>

                {/* Account Counter */}
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-4">Number of data source accounts</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={decrementAccounts}
                      disabled={accountCount <= 1}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={accountCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= 10) setAccountCount(val);
                      }}
                      className="w-16 h-12 rounded-lg border border-border text-center text-xl font-semibold focus:outline-none focus:border-primary"
                      min={1}
                      max={10}
                    />
                    <button
                      type="button"
                      onClick={incrementAccounts}
                      disabled={accountCount >= 10}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold text-foreground">
                      ${displayPrice.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-lg">/mo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed {billingPeriod === "annual" ? "annually" : "monthly"}: ${(displayPrice * (billingPeriod === "annual" ? 12 : 1)).toFixed(0)}/{billingPeriod === "annual" ? "year" : "month"}
                  </p>
                </div>

                {/* Destinations */}
                <div className="mb-6">
                  <p className="text-xs text-muted-foreground text-center mb-3">Destinations</p>
                  <div className="flex items-center justify-center gap-3">
                    {destinations.map((dest) => (
                      <div
                        key={dest.name}
                        title={dest.name}
                      >
                        <dest.icon />
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href="/signup"
                  className="block w-full text-center py-3.5 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-all duration-200 cursor-pointer"
                >
                  Start 14-day free trial →
                </Link>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Unlimited 14-day free trial · Free forever plan
                </p>
              </div>

              {/* Right - Looker Studio Feature (2 cols) */}
              <div className="lg:col-span-2 bg-primary rounded-2xl p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">Looker Studio destination</h3>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-white/80" />
                    <span className="text-white/90">Unlimited data sources, accounts & queries</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-white/80" />
                    <span className="text-white/90">Unlimited support + first-class access</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-white/80" />
                    <span className="text-white/90">Automatic data blending across all sources</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-white/80" />
                    <span className="text-white/90">Free implementation & proof of concept</span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <Link
                    href="#"
                    className="block w-full text-center py-3 bg-white text-primary font-medium rounded-full hover:bg-white/90 transition-all duration-200 cursor-pointer text-sm"
                  >
                    Schedule Demo Call
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full text-center py-3 bg-transparent text-white font-medium rounded-full border border-white/30 hover:bg-white/10 transition-all duration-200 cursor-pointer text-sm"
                  >
                    Start Free Trial →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Plans Include */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* All plans include */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-6">All plans include</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">All 20+ data sources & templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">Destinations</span>
                      <div className="flex items-center gap-1">
                        {destinations.map((dest) => (
                          <dest.icon key={dest.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Unlimited users & reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Unlimited historical data</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">Upgrade or downgrade anytime</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">10</span>
                      <LocationIcon />
                      <span className="text-sm text-foreground">locations = 1 account</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="bg-primary text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">AI</span>
                      <span className="text-sm text-foreground">Query Builder + Alerts & Notifications</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground">Chat & email support</span>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#EA4335"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free forever plan */}
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-semibold text-foreground">Free forever plan</h3>
                  <span className="bg-primary text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    New
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  We&apos;ll never ask for a credit card. Your trial and free plan will always work.
                </p>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">3 data source accounts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">30-day data history</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">FAQs</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    openFaqIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: '#222831' }}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <span className="font-medium pr-4 text-white">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                        openFaqIndex === index ? "bg-primary" : "bg-white/20"
                      }`}
                    >
                      {openFaqIndex === index ? (
                        <X className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: openFaqIndex === index ? "1fr" : "0fr",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="mx-5 mb-5 pt-4 border-t border-primary">
                        <p className="text-sm leading-relaxed text-white/70">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
