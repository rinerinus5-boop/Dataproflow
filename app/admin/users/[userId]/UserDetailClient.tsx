"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  CreditCard,
  Link2,
  Loader2,
  AlertTriangle,
  X,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react";

// Platform icons as SVG components
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface Subscription {
  id: string;
  plan: string;
  status: string;
  trial_end: string | null;
  current_period_end: string | null;
  billing_period: string;
}

interface Connection {
  id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string | null;
  access_token: string;
  refresh_token: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  subscriptions: Subscription[] | Subscription | null;
}

interface UserDetailClientProps {
  user: User;
  connections: Connection[];
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant: "danger" | "warning" | "primary";
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  confirmVariant,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-orange-500 hover:bg-orange-600 text-white",
    primary: "bg-primary hover:bg-primary/90 text-white",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${confirmVariant === "danger" ? "bg-red-100" : confirmVariant === "warning" ? "bg-orange-100" : "bg-primary/10"}`}>
            <AlertTriangle className={`w-6 h-6 ${confirmVariant === "danger" ? "text-red-600" : confirmVariant === "warning" ? "text-orange-500" : "text-primary"}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{message}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 font-medium rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2 ${variantStyles[confirmVariant]}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const platformConfig: Record<string, { icon: React.ComponentType; color: string; bgColor: string; name: string }> = {
  instagram: { icon: InstagramIcon, color: "text-pink-600", bgColor: "bg-pink-100", name: "Instagram" },
  facebook: { icon: FacebookIcon, color: "text-blue-600", bgColor: "bg-blue-100", name: "Facebook" },
  tiktok: { icon: TikTokIcon, color: "text-gray-900", bgColor: "bg-gray-100", name: "TikTok" },
  youtube: { icon: YouTubeIcon, color: "text-red-600", bgColor: "bg-red-100", name: "YouTube" },
  twitter: { icon: TwitterIcon, color: "text-gray-900", bgColor: "bg-gray-100", name: "X (Twitter)" },
};

export default function UserDetailClient({ user, connections }: UserDetailClientProps) {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmVariant: "danger" | "warning" | "primary";
    action: () => Promise<void>;
  } | null>(null);

  const getSubscription = (): Subscription | null => {
    if (!user.subscriptions) return null;
    if (Array.isArray(user.subscriptions)) {
      return user.subscriptions[0] || null;
    }
    return user.subscriptions;
  };

  const subscription = getSubscription();

  const handleAction = async (action: () => Promise<void>) => {
    setActionLoading("modal");
    try {
      await action();
      router.refresh();
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
    }
  };

  const handleToggleActive = () => {
    const isActivating = !user.is_active;
    setConfirmModal({
      isOpen: true,
      title: isActivating ? "Activate User" : "Suspend User",
      message: isActivating
        ? `Are you sure you want to activate ${user.full_name || user.email}?`
        : `Are you sure you want to suspend ${user.full_name || user.email}?`,
      confirmText: isActivating ? "Activate" : "Suspend",
      confirmVariant: isActivating ? "primary" : "warning",
      action: async () => {
        await fetch("/api/admin/users/toggle-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, isActive: isActivating }),
        });
      },
    });
  };

  const handleUpgradePlan = () => {
    setConfirmModal({
      isOpen: true,
      title: "Upgrade Plan",
      message: `Upgrade ${user.full_name || user.email} to Professional plan?`,
      confirmText: "Upgrade",
      confirmVariant: "primary",
      action: async () => {
        await fetch(`/api/admin/users/${user.id}/subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upgrade", plan: "professional" }),
        });
      },
    });
  };

  const handleDowngradePlan = () => {
    setConfirmModal({
      isOpen: true,
      title: "Downgrade Plan",
      message: `Downgrade ${user.full_name || user.email} to Starter plan?`,
      confirmText: "Downgrade",
      confirmVariant: "warning",
      action: async () => {
        await fetch(`/api/admin/users/${user.id}/subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "downgrade", plan: "starter" }),
        });
      },
    });
  };

  const handleDeleteUser = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: `Permanently delete ${user.full_name || user.email}? This cannot be undone.`,
      confirmText: "Delete User",
      confirmVariant: "danger",
      action: async () => {
        const res = await fetch(`/api/admin/users/${user.id}/delete`, { method: "POST" });
        if (res.ok) {
          router.push("/admin/users");
        }
      },
    });
  };

  const activeConnections = connections.filter((c) => c.is_active);
  const allPlatforms = ["instagram", "facebook", "tiktok", "youtube", "twitter"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
          <p className="text-gray-500">View and manage user information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {user.full_name || "No name"}
                  </h2>
                  {user.role === "admin" && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                  {user.email_verified && (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <div>
                {user.is_active ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    <UserCheck className="w-4 h-4" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    <UserX className="w-4 h-4" />
                    Suspended
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div>
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-900">{user.id.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Connected Platforms */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Connected Platforms</h3>
              <span className="text-sm text-gray-500">
                {activeConnections.length} of {allPlatforms.length} connected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {allPlatforms.map((platform) => {
                const config = platformConfig[platform];
                const connection = activeConnections.find(
                  (c) => c.platform.toLowerCase() === platform
                );
                const isConnected = !!connection;
                const Icon = config.icon;

                return (
                  <div
                    key={platform}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      isConnected
                        ? `${config.bgColor} border-current ${config.color}`
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={isConnected ? config.color : "text-gray-400"}>
                        <Icon />
                      </div>
                      <span className={`text-xs font-medium ${isConnected ? "text-gray-900" : "text-gray-400"}`}>
                        {config.name}
                      </span>
                      {isConnected && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    {isConnected && connection.platform_username && (
                      <p className="text-xs text-gray-500 text-center mt-1 truncate">
                        @{connection.platform_username}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {activeConnections.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Connection Details</h4>
                <div className="space-y-2">
                  {activeConnections.map((conn) => {
                    const config = platformConfig[conn.platform.toLowerCase()] || {
                      icon: Link2,
                      color: "text-gray-600",
                      bgColor: "bg-gray-100",
                      name: conn.platform,
                    };
                    const Icon = config.icon;

                    return (
                      <div
                        key={conn.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                            <Icon />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{config.name}</p>
                            <p className="text-sm text-gray-500">
                              {conn.platform_username ? `@${conn.platform_username}` : conn.platform_user_id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Connected</p>
                          <p className="text-sm text-gray-700">
                            {new Date(conn.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeConnections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No platforms connected yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              Subscription
            </h3>

            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-semibold text-gray-900 capitalize">{subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    subscription.status === "active"
                      ? "bg-green-100 text-green-700"
                      : subscription.status === "trialing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Billing</span>
                  <span className="text-gray-900 capitalize">{subscription.billing_period}</span>
                </div>
                {subscription.trial_end && subscription.status === "trialing" && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Trial Ends</span>
                    <span className="text-gray-900">
                      {new Date(subscription.trial_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No subscription</p>
            )}
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-400" />
              Actions
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleUpgradePlan}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-green-500" />
                Upgrade Plan
              </button>
              <button
                type="button"
                onClick={handleDowngradePlan}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <TrendingDown className="w-4 h-4 text-orange-500" />
                Downgrade Plan
              </button>
              <button
                type="button"
                onClick={handleToggleActive}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                {user.is_active ? (
                  <>
                    <UserX className="w-4 h-4 text-orange-500" />
                    Suspend User
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-green-500" />
                    Activate User
                  </>
                )}
              </button>
              <div className="border-t border-gray-100 my-2" />
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          confirmVariant={confirmModal.confirmVariant}
          isLoading={actionLoading === "modal"}
          onConfirm={() => handleAction(confirmModal.action)}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
