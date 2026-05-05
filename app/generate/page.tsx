import { Metadata } from "next";
import MultiStepForm from "@/app/components/forms/MultiStepForm";
import { Sparkles, Zap, Target, Mail, Shield, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";
import LogoMarquee from "../components/ui/LogoMarquee";

export const metadata: Metadata = {
  title: "Generate Your Dashboard",
  description:
    "Answer a few questions and get a personalized marketing analytics dashboard delivered to your inbox.",
};

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-primary/5">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900">
                DataProFlow
              </span>
            </Link>
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Already have an account? </span>Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Free Personalized Dashboard
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Get Your Custom{" "}
              <span className="text-primary">Marketing Dashboard</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Answer a few quick questions about your business, and we&apos;ll
              generate a personalized analytics dashboard tailored to your
              needs.
            </p>
          </div>

          {/* Form */}
          <MultiStepForm />

          {/* Trust Indicators with Auto-Scrolling Marquee */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
              Trusted by 1,000+ businesses worldwide
            </p>
            <LogoMarquee />
          </div>

          {/* Features */}
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              title="Instant Insights"
              description="Get actionable insights from your marketing data in minutes, not hours."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={<Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              title="Personalized for You"
              description="Dashboard customized based on your industry, goals, and marketing channels."
              gradient="from-primary to-indigo-600"
            />
            <FeatureCard
              icon={<Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
              title="Delivered to Your Inbox"
              description="Receive your dashboard link via email - no account required to start."
              gradient="from-emerald-500 to-teal-600"
            />
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 sm:mt-16 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
              Why Choose DataProFlow?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              <BenefitItem
                icon={<Shield className="w-5 h-5 text-primary" />}
                title="Secure & Private"
                description="Your data is encrypted and never shared"
              />
              <BenefitItem
                icon={<Clock className="w-5 h-5 text-primary" />}
                title="Ready in Minutes"
                description="No complex setup or technical skills needed"
              />
              <BenefitItem
                icon={<BarChart3 className="w-5 h-5 text-primary" />}
                title="Professional Reports"
                description="Beautiful, shareable analytics dashboards"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-500">
              © {new Date().getFullYear()} DataProFlow. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/privacy"
                className="text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors cursor-pointer"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br ${gradient} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-linear-to-br ${gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2`} />
    </div>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
