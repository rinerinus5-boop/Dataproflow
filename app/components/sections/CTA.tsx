"use client";

import Link from "next/link";
import ScrollReveal from "../ui/ScrollReveal";

export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="relative bg-foreground rounded-3xl p-10 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Transform your marketing data using{" "}
                <span className="text-primary">DataProFlow</span>
              </h2>
              
              <p className="mt-6 text-lg text-white/70">
                Join thousands of marketers who are already making data-driven decisions.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-foreground bg-white rounded-full hover:bg-white/90 transition-all duration-200 cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Started Free
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
