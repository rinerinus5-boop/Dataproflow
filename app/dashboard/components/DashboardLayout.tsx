"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Bell,
  CreditCard,
  LayoutTemplate,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Subscription } from "@/lib/types/database";
import TrialExpiredModal from "./TrialExpiredModal";
import DashboardBreadcrumb from "@/app/components/ui/DashboardBreadcrumb";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: Profile | null;
  subscription: Subscription | null;
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutTemplate },
  { name: "Connections", href: "/dashboard/connections", icon: Link2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
  user,
  profile,
  subscription,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);

  // Check if trial has expired
  useEffect(() => {
    // Only show trial expired if status is still "trialing" and trial_end has passed
    // Don't show if status is "active" or any other paid status
    if (subscription?.status === "trialing" && subscription?.trial_end) {
      const trialEndDate = new Date(subscription.trial_end);
      const now = new Date();
      if (now > trialEndDate) {
        setTrialExpired(true);
      } else {
        setTrialExpired(false);
      }
    } else {
      // If not trialing, definitely don't show the modal
      setTrialExpired(false);
    }
  }, [subscription]);

  // Sync subscription when redirected from Stripe checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("upgraded") === "true") {
      // Sync subscription from Stripe
      const syncSubscription = async () => {
        try {
          const res = await fetch("/api/stripe/sync-subscription", { method: "POST" });
          const data = await res.json();
          console.log("Subscription synced:", data);
          
          // Remove query param
          window.history.replaceState({}, "", pathname);
          
          // Wait a bit for database to propagate, then reload
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Force a full page reload to get fresh server data
          window.location.reload();
        } catch (error) {
          console.error("Error syncing subscription:", error);
          // Still remove the param even on error
          window.history.replaceState({}, "", pathname);
        }
      };
      syncSubscription();
    }
  }, [pathname]);

  // Only show trial expired modal on non-Plans pages
  const isPlansPage = pathname === "/dashboard/plans";
  const showTrialModal = trialExpired && !isPlansPage;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return null;

    const statusColors: Record<string, string> = {
      trialing: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      canceled: "bg-gray-100 text-gray-700",
      past_due: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          statusColors[subscription.status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {subscription.status === "trialing" ? "Trial" : subscription.plan}
      </span>
    );
  };

  const getPageTitle = () => {
    const currentNav = navigation.find((item) => isActive(item.href));
    return currentNav?.name || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Trial Expired Modal - only show on non-Plans pages */}
      <TrialExpiredModal 
        isOpen={showTrialModal} 
        trialEndDate={subscription?.trial_end} 
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Dropdown Overlay - z-index must be below dropdown (z-[100]) but above content */}
      {profileDropdownOpen && (
        <div
          className="fixed cursor-default"
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">DataProFlow</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade Card - only show for trial users, not for paid users */}
          {subscription?.status === "trialing" && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-primary to-purple-600 rounded-xl text-white">
              <p className="font-medium mb-1">Upgrade to Pro</p>
              <p className="text-sm text-white/80 mb-3">Get unlimited connections and advanced analytics</p>
              <Link
                href="/dashboard/plans"
                className="block w-full py-2 bg-white text-primary text-sm font-medium rounded-lg text-center hover:bg-gray-100 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* User Section in Sidebar */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Subscription Badge */}
              {getSubscriptionBadge()}

              {/* Notifications */}
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "User"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLoggingOut) {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }
                      }}
                      disabled={isLoggingOut}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer ${isLoggingOut ? 'opacity-50' : ''}`}
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <DashboardBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
