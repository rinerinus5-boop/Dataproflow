"use client";

import { useEffect, useRef } from "react";

// Large colorful company logos
const MetaLogo = () => (
  <svg viewBox="0 0 120 24" className="h-8 sm:h-10 w-auto">
    <circle cx="12" cy="12" r="10" fill="#1877F2"/>
    <path d="M16.5 12c0-2.5-2-4.5-4.5-4.5S7.5 9.5 7.5 12s2 4.5 4.5 4.5c1.5 0 2.8-.7 3.6-1.8" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M12 7.5c1.2 0 2.3.5 3.1 1.3" stroke="white" strokeWidth="2" fill="none"/>
    <text x="28" y="17" fontSize="16" fontWeight="700" fill="#1877F2">Meta</text>
  </svg>
);

const GoogleLogo = () => (
  <svg viewBox="0 0 100 28" className="h-8 sm:h-10 w-auto">
    <path d="M12.545 10.239v3.821h5.445c-.242 1.242-.601 2.145-1.266 2.81-.813.813-2.079 1.711-4.179 1.711-3.33 0-5.934-2.686-5.934-6.016s2.604-6.016 5.934-6.016c1.798 0 3.108.706 4.079 1.631l2.695-2.695C17.545 3.839 15.545 2.839 12.545 2.839c-5.523 0-10 4.477-10 10s4.477 10 10 10c2.926 0 5.133-.968 6.859-2.77 1.773-1.773 2.326-4.266 2.326-6.277 0-.623-.047-1.199-.141-1.676h-9.044v.123z" fill="#4285F4"/>
    <text x="30" y="19" fontSize="18" fontWeight="500">
      <tspan fill="#4285F4">G</tspan>
      <tspan fill="#EA4335">o</tspan>
      <tspan fill="#FBBC05">o</tspan>
      <tspan fill="#4285F4">g</tspan>
      <tspan fill="#34A853">l</tspan>
      <tspan fill="#EA4335">e</tspan>
    </text>
  </svg>
);

const ShopifyLogo = () => (
  <svg viewBox="0 0 120 28" className="h-8 sm:h-10 w-auto">
    <path d="M15.5 5c-.2 0-.4.1-.5.3l-1.5 4.5c-.5-.2-1.1-.4-1.8-.4-1.5 0-2.2.9-2.3 1.8 0 .8.5 1.2 1.2 1.6.9.5 1.2.7 1.2 1.2 0 .6-.5 1-1.2 1-.8 0-1.5-.4-2-.8l-.8 2.3c.6.5 1.5.9 2.5.9 1.8 0 3-1 3-2.7 0-1-.6-1.6-1.5-2.1-.7-.4-1-.6-1-1 0-.4.3-.7.9-.7.6 0 1.1.2 1.5.4l.8-2.3c-.1-.1-.2-.2-.3-.2l.3-1.8c0-.1 0-.2-.1-.2-.1-.1-.2-.1-.3-.1h-1.5l.3-1.7h1.6c.2 0 .3-.1.4-.2.1-.1.1-.3.1-.4l-.3-1.5c0-.2-.2-.3-.4-.3h-2.2l.5-2.5c0-.2-.1-.4-.3-.4z" fill="#95BF47"/>
    <text x="25" y="19" fontSize="16" fontWeight="600" fill="#5E8E3E">Shopify</text>
  </svg>
);

const HubSpotLogo = () => (
  <svg viewBox="0 0 120 28" className="h-8 sm:h-10 w-auto">
    <circle cx="12" cy="14" r="8" fill="#FF7A59"/>
    <path d="M12 8v12M8 14h8" stroke="white" strokeWidth="2"/>
    <text x="26" y="19" fontSize="16" fontWeight="700" fill="#FF7A59">HubSpot</text>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 100 28" className="h-8 sm:h-10 w-auto">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.831 1.617-2.348 1.617-1.9 0-4.86-.89-6.964-2.109l-.89 5.549c1.857 1.013 5.197 1.99 8.58 1.99 2.63 0 4.791-.681 6.329-1.957 1.7-1.396 2.528-3.39 2.528-5.94 0-4.215-2.611-5.88-6.937-7.02z" fill="#635BFF"/>
    <text x="28" y="19" fontSize="16" fontWeight="600" fill="#635BFF">Stripe</text>
  </svg>
);

const SalesforceLogo = () => (
  <svg viewBox="0 0 140 28" className="h-8 sm:h-10 w-auto">
    <ellipse cx="14" cy="14" rx="12" ry="10" fill="#00A1E0"/>
    <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="14" cy="16" r="2" fill="white"/>
    <text x="30" y="19" fontSize="14" fontWeight="700" fill="#00A1E0">Salesforce</text>
  </svg>
);

const MailchimpLogo = () => (
  <svg viewBox="0 0 130 28" className="h-8 sm:h-10 w-auto">
    <circle cx="14" cy="14" r="10" fill="#FFE01B"/>
    <path d="M10 12c0-2 1.5-3 4-3s4 1 4 3c0 1.5-1 2.5-2 3-1 .5-2 1-2 2" stroke="#000" strokeWidth="1.5" fill="none"/>
    <circle cx="14" cy="20" r="1" fill="#000"/>
    <text x="30" y="19" fontSize="14" fontWeight="700" fill="#000">Mailchimp</text>
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 100 28" className="h-8 sm:h-10 w-auto">
    <rect x="4" y="10" width="4" height="10" rx="2" fill="#E01E5A"/>
    <rect x="10" y="4" width="4" height="10" rx="2" fill="#36C5F0"/>
    <rect x="16" y="10" width="4" height="10" rx="2" fill="#2EB67D"/>
    <rect x="10" y="16" width="4" height="10" rx="2" fill="#ECB22E"/>
    <text x="28" y="19" fontSize="16" fontWeight="700" fill="#4A154B">Slack</text>
  </svg>
);

const logos = [
  { id: "meta", component: MetaLogo },
  { id: "google", component: GoogleLogo },
  { id: "shopify", component: ShopifyLogo },
  { id: "hubspot", component: HubSpotLogo },
  { id: "stripe", component: StripeLogo },
  { id: "salesforce", component: SalesforceLogo },
  { id: "mailchimp", component: MailchimpLogo },
  { id: "slack", component: SlackLogo },
];

export default function LogoMarquee() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;
      
      // Reset position when we've scrolled half the content (since we duplicate logos)
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling container */}
      <div
        ref={scrollRef}
        className="flex items-center gap-12 sm:gap-16 whitespace-nowrap will-change-transform"
        style={{ width: "fit-content" }}
      >
        {/* First set of logos */}
        {logos.map((logo) => (
          <div
            key={logo.id}
            className="flex items-center justify-center px-4 py-2 hover:scale-110 transition-transform duration-200 cursor-pointer"
          >
            <logo.component />
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {logos.map((logo) => (
          <div
            key={`${logo.id}-dup`}
            className="flex items-center justify-center px-4 py-2 hover:scale-110 transition-transform duration-200 cursor-pointer"
          >
            <logo.component />
          </div>
        ))}
      </div>
    </div>
  );
}
