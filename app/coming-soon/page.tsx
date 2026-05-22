"use client";

import { useState, useEffect } from "react";
import { Rocket, Mail, CheckCircle, Loader2 } from "lucide-react";

const LAUNCH_DATE = new Date("2026-06-15T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(): TimeLeft {
  const difference = LAUNCH_DATE.getTime() - new Date().getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await response.json();
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  };

  const timeBlocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7a71eb]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7a71eb]/10 rounded-full blur-[150px]" />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7a71eb]/20 border border-[#7a71eb]/30">
              <span className="w-2 h-2 bg-[#7a71eb] rounded-full animate-pulse" />
              <span className="text-[#7a71eb] text-sm font-medium tracking-wide uppercase">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7a71eb] to-purple-600 rounded-xl flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                DataProFlow
              </h1>
            </div>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Your all-in-one marketing analytics platform is launching soon. 
              Get unified insights from all your data sources.
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-3 md:gap-6 mb-10">
            {timeBlocks.map((block, index) => (
              <div key={block.label} className="flex items-center gap-3 md:gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center mb-2">
                    <span className="text-2xl md:text-4xl font-bold text-white tabular-nums">
                      {String(block.value).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-500 uppercase tracking-wider">
                    {block.label}
                  </span>
                </div>
                {index < timeBlocks.length - 1 && (
                  <span className="text-2xl md:text-3xl text-[#7a71eb] font-light mb-6">:</span>
                )}
              </div>
            ))}
          </div>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            {status === "success" ? (
              <div className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">
                  You&apos;re on the list! We&apos;ll notify you when we launch.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#7a71eb]/50 focus:ring-2 focus:ring-[#7a71eb]/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="px-6 py-3.5 bg-gradient-to-r from-[#7a71eb] to-purple-600 hover:from-[#6b62dc] hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                  >
                    {status === "loading" ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>Join Waitlist</span>
                      </>
                    )}
                  </button>
                </div>
                {status === "error" && errorMessage && (
                  <p className="text-red-400 text-sm text-center">{errorMessage}</p>
                )}
              </form>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <span>
              {((Date.now() - new Date("2026-01-01").getTime()) / (LAUNCH_DATE.getTime() - new Date("2026-01-01").getTime()) * 100).toFixed(1)}% complete
            </span>
            <span>
              Launch: {LAUNCH_DATE.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Social proof */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Join 500+ marketers already on the waitlist
        </p>
      </div>
    </div>
  );
}
