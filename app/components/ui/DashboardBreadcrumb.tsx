"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Map of dashboard paths to their labels
const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  connections: "Connections",
  analytics: "Analytics",
  settings: "Settings",
  templates: "Templates",
  plans: "Plans",
  admin: "Admin",
  users: "Users",
  transactions: "Transactions",
};

export default function DashboardBreadcrumb() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const items = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      
      // Don't add href for the last item (current page)
      if (index < segments.length - 1) {
        breadcrumbItems.push({ label, href: currentPath });
      } else {
        breadcrumbItems.push({ label });
      }
    });

    return breadcrumbItems;
  }, [pathname]);

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
    const existingScript = document.getElementById("dashboard-breadcrumb-schema");
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.id = "dashboard-breadcrumb-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("dashboard-breadcrumb-schema");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [breadcrumbSchema]);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center mb-6">
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        <li className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
