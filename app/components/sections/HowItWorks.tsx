"use client";

import Image from "next/image";
import ScrollReveal from "../ui/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Connect Your Accounts",
    description:
      "Link your Instagram, Facebook, and TikTok accounts securely using OAuth. Your credentials are never stored.",
    image: "/step1.svg",
  },
  {
    number: "02",
    title: "Choose Your Metrics",
    description:
      "Select the KPIs that matter most to your business. Track impressions, reach, engagement, and conversions.",
    image: "/step2.svg",
  },
  {
    number: "03",
    title: "Visualize & Analyze",
    description:
      "See your data come to life in beautiful dashboards. Make data-driven decisions with confidence.",
    image: "/step3.svg",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-white">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Get started in three simple steps. No technical knowledge required.
          </p>
        </ScrollReveal>

        <div className="mt-16 space-y-20 md:space-y-28">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } items-center gap-12 md:gap-16`}
            >
              <ScrollReveal
                delay={150}
                direction={index % 2 === 0 ? "left" : "right"}
                className="flex-1"
              >
                <div className="space-y-6">
                  <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
                    Step {step.number}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal
                delay={250}
                direction={index % 2 === 0 ? "right" : "left"}
                className="flex-1"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl" />
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={500}
                    height={400}
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
