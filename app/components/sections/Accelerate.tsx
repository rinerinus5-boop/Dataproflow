"use client";

import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "../ui/ScrollReveal";

const benefits = [
  "Real-time data synchronization",
  "Cross-platform analytics",
  "Custom date range filtering",
  "Exportable reports",
];

export default function Accelerate() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <ScrollReveal direction="left" className="flex-1">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Accelerate your business growth with{" "}
                <span className="text-primary">DataProFlow</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop wasting time switching between platforms. Get all your
                marketing insights in one unified dashboard.
              </p>

              <ul className="space-y-4 pt-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary rounded-full hover:bg-primary/90 transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" className="flex-1">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl blur-2xl" />
              <Image
                src="/accelerate-bussiness.svg"
                alt="Accelerate your business"
                width={600}
                height={500}
                className="relative w-full h-auto"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
