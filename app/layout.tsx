import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ProgressBar from "./components/ui/ProgressBar";
import { ToastProvider } from "@/lib/toast";
import ChatWidgetWrapper from "./components/chat/ChatWidgetWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com'),
  title: {
    default: "DataProFlow - Marketing Analytics for Growth",
    template: "%s | DataProFlow",
  },
  description:
    "Connect your Instagram, Facebook, and TikTok accounts to visualize your marketing data in one powerful dashboard. Make data-driven decisions with real-time analytics, custom reports, and actionable insights.",
  keywords: [
    "marketing analytics",
    "social media analytics",
    "marketing dashboard",
    "Instagram analytics",
    "Facebook analytics",
    "TikTok analytics",
    "data visualization",
    "marketing reports",
    "social media metrics",
    "KPI tracking",
    "marketing insights",
    "SaaS",
  ],
  authors: [{ name: "DataProFlow" }],
  creator: "DataProFlow",
  publisher: "DataProFlow",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DataProFlow",
    title: "DataProFlow - Marketing Analytics for Growth",
    description:
      "Connect your social media accounts, visualize your marketing data, and make data-driven decisions. All in one powerful dashboard.",
    images: [
      {
        url: "/home-banner.svg",
        width: 1200,
        height: 630,
        alt: "DataProFlow - Marketing Analytics Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DataProFlow - Marketing Analytics for Growth",
    description:
      "Connect your social media accounts, visualize your marketing data, and make data-driven decisions.",
    images: ["/home-banner.svg"],
    creator: "@dataproflow",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://dataproflow.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DataProFlow",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Marketing analytics platform that connects Instagram, Facebook, and TikTok to visualize your marketing data in one powerful dashboard.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "28",
    highPrice: "99",
    priceCurrency: "USD",
    offerCount: "3",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "Instagram Analytics",
    "Facebook Analytics",
    "TikTok Analytics",
    "Real-time Dashboard",
    "Custom Reports",
    "Data Export",
    "API Access",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DataProFlow",
  url: "https://dataproflow.com",
  logo: "https://dataproflow.com/logo.png",
  sameAs: [
    "https://twitter.com/dataproflow",
    "https://linkedin.com/company/dataproflow",
    "https://instagram.com/dataproflow",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <Suspense fallback={null}>
            <ProgressBar />
          </Suspense>
          {children}
          <ChatWidgetWrapper />
        </ToastProvider>
      </body>
    </html>
  );
}
