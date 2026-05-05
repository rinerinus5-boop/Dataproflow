"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Building2,
  Users,
  DollarSign,
  Target,
  Megaphone,
  AlertCircle,
  Mail,
  User,
  Sparkles,
  TrendingUp,
  Heart,
  PiggyBank,
  BarChart3,
  Zap,
  CircleDollarSign,
  Plus,
  Star,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  companyName: string;
  industry: string;
  businessSize: string;
  monthlyRevenue: string;
  marketingChannels: string[];
  mainGoals: string[];
  currentChallenges: string;
}

interface MultiStepFormProps {
  onComplete?: (data: FormData) => void;
}

const INDUSTRIES = [
  "E-commerce / Retail",
  "SaaS / Technology",
  "Healthcare",
  "Finance / Banking",
  "Education",
  "Real Estate",
  "Marketing Agency",
  "Manufacturing",
  "Food & Beverage",
  "Travel & Hospitality",
  "Other",
];

const BUSINESS_SIZES = [
  "Solo / Freelancer",
  "2-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

const REVENUE_RANGES = [
  "Less than $10K/month",
  "$10K - $50K/month",
  "$50K - $100K/month",
  "$100K - $500K/month",
  "$500K - $1M/month",
  "More than $1M/month",
  "Prefer not to say",
];

// Instagram Icon
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#instagram-gradient)" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="url(#instagram-gradient)" strokeWidth="2"/>
    <circle cx="18" cy="6" r="1.5" fill="url(#instagram-gradient)"/>
    <defs>
      <linearGradient id="instagram-gradient" x1="2" y1="22" x2="22" y2="2">
        <stop stopColor="#FFDC80"/>
        <stop offset="0.5" stopColor="#F56040"/>
        <stop offset="1" stopColor="#833AB4"/>
      </linearGradient>
    </defs>
  </svg>
);

// Facebook Icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

// TikTok Icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

// LinkedIn Icon
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

// Twitter/X Icon
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// YouTube Icon
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Google Ads Icon
const GoogleAdsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M12.006 17.196L5.282 5.853c-.67-1.13-2.122-1.503-3.242-.833-1.12.67-1.493 2.122-.823 3.242l6.724 11.343c.67 1.13 2.122 1.503 3.242.833 1.12-.67 1.493-2.122.823-3.242z" fill="#FBBC04"/>
    <path d="M21.96 17.196l-6.724-11.343c-.67-1.13-2.122-1.503-3.242-.833-1.12.67-1.493 2.122-.823 3.242l6.724 11.343c.67 1.13 2.122 1.503 3.242.833 1.12-.67 1.493-2.122.823-3.242z" fill="#4285F4"/>
    <circle cx="5" cy="19" r="3" fill="#34A853"/>
  </svg>
);

// Email Marketing Icon
const EmailMarketingIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#EA4335" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M22 6l-10 7L2 6"/>
  </svg>
);

// SEO Icon
const SEOIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#34A853" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <path d="M11 8v6M8 11h6"/>
  </svg>
);

const MARKETING_CHANNELS = [
  { id: "instagram", label: "Instagram", icon: InstagramIcon },
  { id: "facebook", label: "Facebook", icon: FacebookIcon },
  { id: "tiktok", label: "TikTok", icon: TikTokIcon },
  { id: "linkedin", label: "LinkedIn", icon: LinkedInIcon },
  { id: "twitter", label: "Twitter/X", icon: TwitterIcon },
  { id: "youtube", label: "YouTube", icon: YouTubeIcon },
  { id: "google_ads", label: "Google Ads", icon: GoogleAdsIcon },
  { id: "email", label: "Email Marketing", icon: EmailMarketingIcon },
  { id: "seo", label: "SEO", icon: SEOIcon },
  { id: "other", label: "Other", icon: Plus },
];

const BUSINESS_GOALS = [
  { id: "increase_sales", label: "Increase Sales", icon: CircleDollarSign, color: "text-green-600" },
  { id: "brand_awareness", label: "Build Brand Awareness", icon: Star, color: "text-yellow-500" },
  { id: "lead_generation", label: "Generate More Leads", icon: TrendingUp, color: "text-blue-600" },
  { id: "customer_retention", label: "Improve Customer Retention", icon: Heart, color: "text-red-500" },
  { id: "reduce_costs", label: "Reduce Marketing Costs", icon: PiggyBank, color: "text-pink-500" },
  { id: "data_insights", label: "Better Data Insights", icon: BarChart3, color: "text-indigo-600" },
  { id: "automation", label: "Marketing Automation", icon: Zap, color: "text-amber-500" },
  { id: "roi_tracking", label: "Track ROI Better", icon: Target, color: "text-purple-600" },
];

const TOTAL_STEPS = 7;

export default function MultiStepForm({ onComplete }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    companyName: "",
    industry: "",
    businessSize: "",
    monthlyRevenue: "",
    marketingChannels: [],
    mainGoals: [],
    currentChallenges: "",
  });

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  const toggleArrayField = useCallback(
    (field: "marketingChannels" | "mainGoals", value: string) => {
      setFormData((prev) => {
        const currentArray = prev[field];
        const newArray = currentArray.includes(value)
          ? currentArray.filter((item) => item !== value)
          : [...currentArray, value];
        return { ...prev, [field]: newArray };
      });
      setError(null);
    },
    []
  );

  const validateCurrentStep = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.companyName.trim()) {
          setError("Please enter your company name");
          return false;
        }
        break;
      case 2:
        if (!formData.industry) {
          setError("Please select your industry");
          return false;
        }
        break;
      case 3:
        if (!formData.businessSize) {
          setError("Please select your business size");
          return false;
        }
        break;
      case 4:
        if (!formData.monthlyRevenue) {
          setError("Please select your revenue range");
          return false;
        }
        break;
      case 5:
        if (formData.marketingChannels.length === 0) {
          setError("Please select at least one marketing channel");
          return false;
        }
        break;
      case 6:
        if (formData.mainGoals.length === 0) {
          setError("Please select at least one business goal");
          return false;
        }
        break;
      case 7:
        if (!formData.name.trim()) {
          setError("Please enter your name");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Please enter your email");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        break;
    }
    return true;
  }, [currentStep, formData]);

  const nextStep = useCallback(() => {
    if (!validateCurrentStep()) return;
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setDirection(-1);
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/form/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit form");
      }

      setIsSuccess(true);
      onComplete?.(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep < TOTAL_STEPS) {
      e.preventDefault();
      nextStep();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Thank You, {formData.name}!
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We&apos;re generating your personalized dashboard. You&apos;ll receive
          an email at <strong>{formData.email}</strong> with your dashboard link
          shortly.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Processing your data...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto" onKeyDown={handleKeyDown}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[400px] relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {/* Step 1: Company Name */}
            {currentStep === 1 && (
              <StepContainer
                icon={<Building2 className="w-8 h-8 text-primary" />}
                title="What's your company name?"
                subtitle="Let's start with the basics"
              >
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors cursor-text"
                  autoFocus
                />
              </StepContainer>
            )}

            {/* Step 2: Industry */}
            {currentStep === 2 && (
              <StepContainer
                icon={<Target className="w-8 h-8 text-primary" />}
                title="What industry are you in?"
                subtitle="This helps us customize your dashboard"
              >
                <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {INDUSTRIES.map((industry) => (
                    <SelectableCard
                      key={industry}
                      label={industry}
                      selected={formData.industry === industry}
                      onClick={() => updateField("industry", industry)}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step 3: Business Size */}
            {currentStep === 3 && (
              <StepContainer
                icon={<Users className="w-8 h-8 text-primary" />}
                title="How big is your team?"
                subtitle="Select your company size"
              >
                <div className="grid grid-cols-2 gap-3">
                  {BUSINESS_SIZES.map((size) => (
                    <SelectableCard
                      key={size}
                      label={size}
                      selected={formData.businessSize === size}
                      onClick={() => updateField("businessSize", size)}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step 4: Monthly Revenue */}
            {currentStep === 4 && (
              <StepContainer
                icon={<DollarSign className="w-8 h-8 text-primary" />}
                title="What's your monthly revenue?"
                subtitle="This helps us provide relevant insights"
              >
                <div className="grid grid-cols-2 gap-3">
                  {REVENUE_RANGES.map((range) => (
                    <SelectableCard
                      key={range}
                      label={range}
                      selected={formData.monthlyRevenue === range}
                      onClick={() => updateField("monthlyRevenue", range)}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step 5: Marketing Channels */}
            {currentStep === 5 && (
              <StepContainer
                icon={<Megaphone className="w-8 h-8 text-primary" />}
                title="Which marketing channels do you use?"
                subtitle="Select all that apply"
              >
                <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {MARKETING_CHANNELS.map((channel) => (
                    <SelectableCardWithIcon
                      key={channel.id}
                      label={channel.label}
                      IconComponent={channel.icon}
                      selected={formData.marketingChannels.includes(channel.id)}
                      onClick={() =>
                        toggleArrayField("marketingChannels", channel.id)
                      }
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step 6: Business Goals */}
            {currentStep === 6 && (
              <StepContainer
                icon={<Target className="w-8 h-8 text-primary" />}
                title="What are your main business goals?"
                subtitle="Select all that apply"
              >
                <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                  {BUSINESS_GOALS.map((goal) => (
                    <SelectableCardWithIcon
                      key={goal.id}
                      label={goal.label}
                      IconComponent={goal.icon}
                      iconColor={goal.color}
                      selected={formData.mainGoals.includes(goal.id)}
                      onClick={() => toggleArrayField("mainGoals", goal.id)}
                    />
                  ))}
                </div>
              </StepContainer>
            )}

            {/* Step 7: Contact Info */}
            {currentStep === 7 && (
              <StepContainer
                icon={<Mail className="w-8 h-8 text-primary" />}
                title="Where should we send your dashboard?"
                subtitle="We'll email you the link once it's ready"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors cursor-text"
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="Your email address"
                      className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors cursor-text"
                    />
                  </div>
                  <div>
                    <textarea
                      value={formData.currentChallenges}
                      onChange={(e) =>
                        updateField("currentChallenges", e.target.value)
                      }
                      placeholder="Any specific challenges you're facing? (optional)"
                      rows={3}
                      className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 outline-none transition-colors resize-none cursor-text"
                    />
                  </div>
                </div>
              </StepContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-24 left-8 right-8 flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer ${
              currentStep === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/25"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Dashboard...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate My Dashboard
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              index + 1 === currentStep
                ? "w-6 bg-primary"
                : index + 1 < currentStep
                ? "bg-primary"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Step Container Component
function StepContainer({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

// Selectable Card Component
function SelectableCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/5 text-gray-900"
          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <span className="font-medium text-sm">{label}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
            <Check className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}
    </button>
  );
}

// Selectable Card with Icon Component (for marketing channels and goals)
function SelectableCardWithIcon({
  label,
  IconComponent,
  iconColor,
  selected,
  onClick,
}: {
  label: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
        selected
          ? "border-primary bg-primary/5 text-gray-900"
          : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      <div className={`shrink-0 ${iconColor || ""}`}>
        <IconComponent className="w-5 h-5" />
      </div>
      <span className="font-medium text-sm">{label}</span>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center bg-primary">
            <Check className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}
    </button>
  );
}
