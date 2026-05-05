"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  // Generate JSON-LD schema for breadcrumbs
  const breadcrumbSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: typeof window !== "undefined" ? window.location.origin : "https://dataproflow.com",
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href && {
          item: typeof window !== "undefined" 
            ? `${window.location.origin}${item.href}` 
            : `https://dataproflow.com${item.href}`,
        }),
      })),
    ],
  }), [items]);

  useEffect(() => {
    // Add breadcrumb schema to head
    const existingScript = document.getElementById("breadcrumb-schema");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "breadcrumb-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("breadcrumb-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [breadcrumbSchema]);

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
