"use client";

import Link from "next/link";
import ScrollReveal from "../ui/ScrollReveal";
import ImageSlider from "../ui/ImageSlider";

const MetaIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" fill="#1877F2"/>
  </svg>
);

const GA4Icon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.84 2.998v17.958c0 .554-.45 1.004-1.004 1.004H14.87a1.004 1.004 0 01-1.004-1.004v-4.49a1.004 1.004 0 011.004-1.003h2.99V9.49h-2.99a1.004 1.004 0 01-1.004-1.004V2.998c0-.554.45-1.004 1.004-1.004h6.966c.554 0 1.004.45 1.004 1.004z" fill="#F9AB00"/>
    <path d="M10.13 21.96H3.164a1.004 1.004 0 01-1.004-1.004V8.486c0-.554.45-1.004 1.004-1.004h6.966c.554 0 1.004.45 1.004 1.004v12.47c0 .554-.45 1.004-1.004 1.004z" fill="#E37400"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ShopifyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#96BF48">
    <path d="M15.337 3.415c-.022-.165-.187-.247-.312-.26-.124-.014-2.739-.165-2.739-.165s-1.817-1.806-2.008-1.997c-.19-.19-.562-.134-.707-.09-.02.006-.382.118-.975.302-.58-1.674-1.604-3.21-3.406-3.21-.05 0-.1.002-.15.005C4.57-2.293 3.96-2 3.443-2c-2.633 0-3.89 3.293-4.285 4.967-.998.31-1.71.53-1.8.558-.56.176-.577.194-.65.72C-3.36 4.7-5 17.986-5 17.986L10.847 21l6.836-1.476S15.36 3.58 15.337 3.415z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const dataSources = [
  { name: "Meta Ads", icon: MetaIcon },
  { name: "Google Analytics", icon: GA4Icon },
  { name: "Google Ads", icon: GoogleIcon },
  { name: "Shopify", icon: ShopifyIcon },
  { name: "TikTok", icon: TikTokIcon },
  { name: "LinkedIn", icon: LinkedInIcon },
];

export default function Hero() {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <ScrollReveal direction="left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
                Marketing Analytics for{" "}
                <span className="text-primary">Growth</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={100} direction="left">
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Connect your marketing data from 20+ sources and visualize in Looker Studio, Google Sheets & BigQuery. No code required.
              </p>
            </ScrollReveal>

            {/* Data Sources Pills */}
            <ScrollReveal delay={150} direction="left">
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {dataSources.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-border text-sm shadow-sm"
                  >
                    <source.icon />
                    <span className="text-foreground text-xs font-medium">{source.name}</span>
                  </div>
                ))}
                <span className="text-sm text-muted-foreground">+14 more</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200} direction="left">
              <div className="mt-10 flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Link
                  href="/generate"
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-primary rounded-full hover:bg-foreground transition-all duration-200 cursor-pointer hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-0.5"
                >
                  Get Free Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const element = document.getElementById("how-it-works");
                    if (element) {
                      const offsetTop = element.offsetTop - 80;
                      window.scrollTo({
                        top: offsetTop,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-foreground bg-transparent border border-border rounded-full hover:bg-secondary transition-all duration-200 cursor-pointer"
                >
                  See How It Works
                </button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300} direction="left">
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No credit card required</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200} direction="right" className="flex-1 w-full">
            <div className="relative w-full">
              <div className="absolute -inset-4 bg-linear-to-br from-primary/10 to-transparent rounded-3xl blur-2xl" />
              <ImageSlider
                slides={[
                  { src: "/slide1.png", alt: "DataProFlow Instagram Performance Dashboard" },
                  { src: "/slide2.png", alt: "DataProFlow Analytics Spreadsheet View" },
                ]}
                autoSlideInterval={5000}
                className="relative shadow-2xl"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
