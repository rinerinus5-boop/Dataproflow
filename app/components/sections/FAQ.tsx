"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const faqs = [
  {
    question: "What is DataProFlow?",
    answer:
      "DataProFlow is a marketing analytics platform that connects your social media accounts (Instagram, Facebook, TikTok) and visualizes all your marketing data in one powerful dashboard. It helps you make data-driven decisions with real-time analytics and custom reports.",
  },
  {
    question: "Is DataProFlow SEO-friendly?",
    answer:
      "Yes, DataProFlow is designed with SEO best practices in mind. You can easily track your social media metrics, analyze engagement patterns, and optimize your content strategy based on data insights. Our platform also generates clean, exportable reports that you can use for presentations and stakeholder meetings.",
  },
  {
    question: "How do I connect my social media accounts?",
    answer:
      "Simply click on 'Add Connector' in your dashboard, select the platform you want to connect (Instagram, Facebook, or TikTok), and follow the OAuth authentication flow. Your credentials are never stored on our servers—we use secure token-based authentication.",
  },
  {
    question: "What data can I track with DataProFlow?",
    answer:
      "You can track impressions, reach, engagement, clicks, follower growth, and conversions across Instagram, Facebook, and TikTok. More platforms like Google Ads, LinkedIn, and Twitter are coming soon. Our dashboard provides real-time metrics and historical data analysis.",
  },
  {
    question: "Can I customize my dashboard?",
    answer:
      "Absolutely! DataProFlow offers fully customizable dashboards. You can choose which metrics to display, create custom date ranges, set up automated reports, and even white-label the dashboard for client presentations on our Growth and Scale plans.",
  },
  {
    question: "Do you offer a free trial?",
    answer:
      "Yes! We offer a 14-day free trial on all plans with no credit card required. You can also use our free forever plan which includes 3 data source accounts and 30-day data history.",
  },
];

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen ? "ring-2 ring-primary" : ""
      }`}
      style={{ backgroundColor: '#222831' }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
        onClick={onClick}
      >
        <span className="font-semibold pr-4 text-white">
          {question}
        </span>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
            isOpen ? "bg-primary" : "bg-white/20"
          }`}
        >
          {isOpen ? (
            <X className="w-4 h-4 text-white" />
          ) : (
            <Plus className="w-4 h-4 text-white" />
          )}
        </div>
      </button>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="mx-5 mb-5 pt-4 border-t border-primary">
            <p className="leading-relaxed text-white/70">
              {answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-secondary">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:w-2/5">
            <ScrollReveal>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Frequently Asked Questions
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={200} className="mt-10 hidden lg:block">
              <Image
                src="/faq.svg"
                alt="FAQ Illustration"
                width={400}
                height={300}
                className="w-full max-w-sm h-auto"
              />
            </ScrollReveal>
          </div>

          <div className="lg:w-3/5">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} delay={100 + index * 50}>
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openIndex === index}
                    onClick={() =>
                      setOpenIndex(openIndex === index ? null : index)
                    }
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
