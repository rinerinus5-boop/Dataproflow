"use client";

import { FileText, DollarSign, Shield } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const features = [
  {
    icon: FileText,
    title: "Easy Setup",
    description:
      "Get going in minutes not months. Connect your accounts and start visualizing data instantly.",
  },
  {
    icon: DollarSign,
    title: "Flexible Pricing",
    description:
      "Find the right pricing plan for your custom needs. Scale as your business grows.",
  },
  {
    icon: Shield,
    title: "Secure Solution",
    description:
      "Highest security standards will provide you peace of mind. Your data is always protected.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-secondary">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground max-w-2xl">
            Including Custom-made Illustrations
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Our unique platform will allow you to understand your marketing
            performance in an engaging and{" "}
            <span className="text-primary">insightful way</span>.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={150 + index * 100} className="h-full">
              <div className="group bg-white rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 cursor-pointer h-full flex flex-col border border-transparent hover:border-primary/20">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
