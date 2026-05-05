"use client";

import { Instagram, Facebook, Linkedin } from "lucide-react";
import ScrollReveal from "../ui/ScrollReveal";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const GoogleAdsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M12.25 1.47l-9.47 16.41a3.98 3.98 0 003.44 5.97 3.98 3.98 0 003.44-1.99l9.47-16.41a3.98 3.98 0 00-3.44-5.97 3.98 3.98 0 00-3.44 1.99z" fill="#FBBC04"/>
    <path d="M21.22 17.88a3.98 3.98 0 11-6.88 3.97 3.98 3.98 0 016.88-3.97z" fill="#4285F4"/>
    <path d="M6.19 13.91L2.78 17.88a3.98 3.98 0 003.44 5.97c1.42 0 2.73-.75 3.44-1.99l3.41-5.91-6.88-2.04z" fill="#34A853"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const integrations = [
  {
    name: "Instagram",
    description: "Track followers, engagement, reach, and story performance.",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    name: "Facebook",
    description: "Monitor page insights, ad performance, and audience growth.",
    icon: Facebook,
    color: "bg-blue-600",
  },
  {
    name: "TikTok",
    description: "Analyze video views, engagement rates, and follower trends.",
    icon: TikTokIcon,
    color: "bg-black",
  },
];

const comingSoon = [
  {
    name: "Google Ads",
    description: "Track ad campaigns, conversions, and ROI metrics.",
    icon: GoogleAdsIcon,
    color: "bg-white border border-border",
    textColor: "text-foreground",
    badge: "Coming Soon",
  },
  {
    name: "LinkedIn",
    description: "Monitor company page analytics and ad performance.",
    icon: Linkedin,
    color: "bg-[#0A66C2]",
    textColor: "text-white",
    badge: "Coming Soon",
  },
  {
    name: "Twitter/X",
    description: "Track tweets, engagement, and audience insights.",
    icon: TwitterIcon,
    color: "bg-black",
    textColor: "text-white",
    badge: "Coming Soon",
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="py-20 md:py-28 bg-secondary">
      <div className="@container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Integrations
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Connect your favorite platforms and centralize all your marketing
            data in one place.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <ScrollReveal key={integration.name} delay={150 + index * 100}>
              <div className="group bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer h-full">
                <div
                  className={`w-14 h-14 rounded-xl ${integration.color} flex items-center justify-center mb-6 text-white`}
                >
                  <integration.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {integration.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {integration.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {comingSoon.map((item, index) => (
            <ScrollReveal key={item.name} delay={450 + index * 100} className="h-full">
              <div className="group bg-white rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer h-full relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {item.badge}
                  </span>
                </div>
                <div
                  className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mb-6 ${item.textColor}`}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
