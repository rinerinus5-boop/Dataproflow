"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

function VerifySuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [stage, setStage] = useState<"verifying" | "success" | "redirecting">("verifying");

  useEffect(() => {
    // Stage 1: Verifying (1 second)
    const timer1 = setTimeout(() => {
      setStage("success");
    }, 1000);

    // Stage 2: Success message (1.5 seconds)
    const timer2 = setTimeout(() => {
      setStage("redirecting");
    }, 2500);

    // Stage 3: Redirect (after 3 seconds total)
    const timer3 = setTimeout(() => {
      router.push(next);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router, next]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">DataProFlow</span>
        </div>

        {/* Icon */}
        <div className="mb-6">
          {stage === "verifying" ? (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-scale-in">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {stage === "verifying" && "Verifying your email..."}
          {stage === "success" && "Email Verified!"}
          {stage === "redirecting" && "Redirecting..."}
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-8">
          {stage === "verifying" && "Please wait while we verify your email address."}
          {stage === "success" && "Your email has been successfully verified."}
          {stage === "redirecting" && "Taking you to your dashboard..."}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: stage === "verifying" ? "33%" : stage === "success" ? "66%" : "100%",
            }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between mt-4 text-xs text-gray-400">
          <span className={stage !== "verifying" ? "text-primary font-medium" : ""}>
            Verifying
          </span>
          <span className={stage === "success" || stage === "redirecting" ? "text-primary font-medium" : ""}>
            Confirmed
          </span>
          <span className={stage === "redirecting" ? "text-primary font-medium" : ""}>
            Dashboard
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 mt-6">Loading...</h1>
        </div>
      </div>
    }>
      <VerifySuccessContent />
    </Suspense>
  );
}
