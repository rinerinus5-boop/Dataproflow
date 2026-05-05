"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface TrialExpiredModalProps {
  isOpen: boolean;
  trialEndDate?: string | null;
}

export default function TrialExpiredModal({ isOpen, trialEndDate }: TrialExpiredModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleUpgradeNow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "starter",
          billingPeriod: "monthly",
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Failed to create checkout session:", data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Your Trial Has Expired
        </h2>
        
        <p className="text-gray-600 mb-2">
          Your 14-day free trial ended on {formatDate(trialEndDate)}.
        </p>
        
        <p className="text-gray-600 mb-6">
          To continue using DataProFlow and access your connected accounts, please upgrade to a paid plan.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleUpgradeNow}
            disabled={isLoading}
            className="block w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to checkout...
              </span>
            ) : (
              "Upgrade Now - $29/month"
            )}
          </button>
          
          <p className="text-xs text-gray-500">
            Starter plan. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
