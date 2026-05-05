"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile, Subscription, ConnectedAccount } from "@/lib/types/database";

interface DashboardClientProps {
  user: User;
  profile: Profile | null;
  subscription: Subscription | null;
  connectedAccounts: ConnectedAccount[];
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Connections", href: "/dashboard/connections", icon: Link2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const platformIcons: Record<string, string> = {
  instagram: "📸",
  facebook: "📘",
  tiktok: "🎵",
};

export default function DashboardClient({
  user,
  profile,
  subscription,
  connectedAccounts,
}: DashboardClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[subscription.status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {subscription.status === "trialing" ? "Trial" : subscription.status}
      </span>
    );
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end) return null;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="DataProFlow" width={120} height={32} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <UserIcon className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            <div className="flex items-center gap-3">
              {getSubscriptionBadge()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Trial Banner */}
          {subscription?.status === "trialing" && getTrialDaysLeft() !== null && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{getTrialDaysLeft()} days left</span> in your free trial.
                  Upgrade now to keep your data flowing.
                </p>
              </div>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Connected Accounts</h3>
                <Link2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground">{connectedAccounts.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                of {subscription?.plan === "enterprise" ? "unlimited" : subscription?.plan === "professional" ? "5" : "1"} accounts
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold text-foreground capitalize">
                {subscription?.plan || "Starter"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {subscription?.billing_period || "monthly"} billing
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Account Status</h3>
                {profile?.email_verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <p className="text-3xl font-bold text-foreground">
                {profile?.email_verified ? "Verified" : "Pending"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.email_verified ? "Email confirmed" : "Please verify your email"}
              </p>
            </div>
          </div>

          {/* Connected Accounts Section */}
          <div className="bg-white rounded-xl border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
              <Link
                href="/dashboard/connections"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Connection
              </Link>
            </div>

            {connectedAccounts.length > 0 ? (
              <div className="divide-y divide-border">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platformIcons[account.platform]}</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {account.platform_username || account.platform}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">{account.platform}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Link2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No connections yet</h3>
                <p className="text-muted-foreground mb-6">
                  Connect your first data source to start visualizing your marketing data.
                </p>
                <Link
                  href="/dashboard/connections"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Connect Data Source
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
