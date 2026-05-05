"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Instagram,
  Facebook,
  Music2,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

// ── Toast ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

let toastCounter = 0;

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm px-4 py-3 rounded-xl shadow-lg border text-sm animate-in slide-in-from-bottom-4 fade-in duration-300
            ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-900" : ""}
            ${toast.type === "error"   ? "bg-red-50 border-red-200 text-red-900"     : ""}
            ${toast.type === "info"    ? "bg-blue-50 border-blue-200 text-blue-900"  : ""}
          `}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {toast.type === "error"   && <AlertCircle className="w-4 h-4 text-red-600"   />}
            {toast.type === "info"    && <AlertCircle className="w-4 h-4 text-blue-600"  />}
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-snug">{toast.title}</p>
            {toast.message && <p className="mt-0.5 opacity-80">{toast.message}</p>}
          </div>
          <button
            type="button"
            onClick={() => onRemove(toast.id)}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  return { toasts, show, remove };
}
// ─────────────────────────────────────────────────────────────────────────────

interface ConnectedAccount {
  id: string;
  platform: string;
  platform_username: string | null;
  created_at: string;
}

interface Subscription {
  plan: string;
  status: string;
}

interface ConnectionsClientProps {
  connectedAccounts: ConnectedAccount[];
  subscription: Subscription | null;
}

const availablePlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Connect your Instagram Business account",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    connectUrl: "/api/oauth/instagram/connect",
  },
  {
    id: "facebook",
    name: "Facebook",
    description: "Connect your Facebook Pages",
    icon: Facebook,
    color: "bg-blue-600",
    connectUrl: "/api/oauth/facebook/connect",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Connect your TikTok Business account",
    icon: Music2,
    color: "bg-black",
    connectUrl: "/api/oauth/tiktok/connect",
  },
];

export default function ConnectionsClient({
  connectedAccounts: initialAccounts,
  subscription: initialSubscription,
}: ConnectionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, show: showToast, remove: removeToast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState(initialAccounts);
  const [subscription, setSubscription] = useState(initialSubscription);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [syncingSubscription, setSyncingSubscription] = useState(false);

  // Check for success/error messages from OAuth callback
  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const hasPaidPlan = subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing";
  const hasActiveSubscription = hasPaidPlan || isTrialing;

  const handleSyncSubscription = async () => {
    setSyncingSubscription(true);
    try {
      const res = await fetch("/api/stripe/sync-subscription", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSubscription({
          plan: data.subscription.plan,
          status: data.subscription.status,
        });
        showToast("success", "Subscription synced!", "Your plan has been updated.");
        router.refresh();
      } else {
        showToast("error", "Sync failed", "Could not sync subscription. Please try again.");
      }
    } catch (err) {
      console.error("Sync subscription error:", err);
      showToast("error", "Sync failed", "An unexpected error occurred.");
    } finally {
      setSyncingSubscription(false);
    }
  };

  const getMaxConnections = () => {
    if (!hasActiveSubscription) return 0;
    switch (subscription?.plan) {
      case "enterprise":
        return "Unlimited";
      case "professional":
        return 5;
      default:
        return 1;
    }
  };

  const canAddMore = () => {
    if (!hasActiveSubscription) return false;
    const max = getMaxConnections();
    if (max === "Unlimited") return true;
    return connectedAccounts.length < (max as number);
  };

  const handleConnect = (connectUrl: string) => {
    // Redirect to OAuth flow
    window.location.href = connectUrl;
  };

  const handleSync = async (connectionId: string) => {
    setSyncingId(connectionId);
    const account = connectedAccounts.find((a) => a.id === connectionId);
    const platformName = account?.platform
      ? account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
      : "Account";

    try {
      const res = await fetch("/api/connections/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          "success",
          `${platformName} synced!`,
          `${data.recordsSynced ?? 0} record${data.recordsSynced === 1 ? "" : "s"} updated.`
        );
        router.refresh();
      } else {
        const data = await res.json();
        showToast("error", "Sync failed", data.error || "Failed to sync data. Please try again.");
      }
    } catch (err) {
      console.error("Sync error:", err);
      showToast("error", "Sync failed", "An unexpected error occurred.");
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm("Are you sure you want to disconnect this account?")) return;

    const account = connectedAccounts.find((a) => a.id === connectionId);
    const platformName = account?.platform
      ? account.platform.charAt(0).toUpperCase() + account.platform.slice(1)
      : "Account";

    setDisconnectingId(connectionId);
    try {
      const res = await fetch("/api/connections/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (res.ok) {
        setConnectedAccounts((prev) =>
          prev.filter((acc) => acc.id !== connectionId)
        );
        showToast("info", `${platformName} disconnected`, "The account has been removed.");
        router.refresh();
      } else {
        const data = await res.json();
        showToast("error", "Disconnect failed", data.error || "Failed to disconnect account.");
      }
    } catch (err) {
      console.error("Disconnect error:", err);
      showToast("error", "Disconnect failed", "An unexpected error occurred.");
    } finally {
      setDisconnectingId(null);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    const messages: Record<string, string> = {
      oauth_denied: "You denied access to your account.",
      no_pages: "No Facebook Pages found. Please create a Page first.",
      no_instagram_business:
        "No Instagram Business account found. Make sure your Instagram is connected to a Facebook Page.",
      limit_reached:
        "You've reached your connection limit. Upgrade to add more.",
      no_subscription: "You need an active subscription to connect accounts.",
      callback_failed: "Something went wrong. Please try again.",
      missing_params: "Invalid OAuth response. Please try again.",
    };
    return messages[errorCode] || "An error occurred. Please try again.";
  };

  return (
    <div className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">
              Successfully connected {success}!
            </p>
            <p className="text-sm text-green-600">
              Your account data will be synced shortly.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-medium text-red-800">Connection Failed</p>
            <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Connections</h2>
          <p className="text-gray-500 mt-1">
            Connect your marketing platforms to start collecting data.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {connectedAccounts.length} / {getMaxConnections()} connections
        </div>
      </div>

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Active Connections</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {connectedAccounts.map((account) => {
              const platform = availablePlatforms.find(
                (p) => p.id === account.platform
              );
              const Icon = platform?.icon || Instagram;
              const isSyncing = syncingId === account.id;
              const isDisconnecting = disconnectingId === account.id;

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${platform?.color || "bg-gray-500"} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {account.platform_username || account.platform}
                      </p>
                      <p className="text-sm text-gray-500">
                        Connected{" "}
                        {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSync(account.id)}
                      disabled={isSyncing}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50"
                      title="Sync data"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(account.id)}
                      disabled={isDisconnecting}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer disabled:opacity-50"
                      title="Remove connection"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Available Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePlatforms.map((platform) => {
            const Icon = platform.icon;
            const isConnected = connectedAccounts.some(
              (a) => a.platform === platform.id
            );

            return (
              <div
                key={platform.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${platform.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {isConnected && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Connected
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {platform.name}
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  {platform.description}
                </p>
                {isConnected ? (
                  <Link
                    href="/dashboard/analytics"
                    className="w-full py-2 px-4 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Data
                  </Link>
                ) : canAddMore() ? (
                  <button
                    type="button"
                    onClick={() => handleConnect(platform.connectUrl)}
                    className="w-full py-2 px-4 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Connect
                  </button>
                ) : (
                  <Link
                    href="/dashboard/plans"
                    className="w-full py-2 px-4 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                  >
                    Upgrade to Connect
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Sync Notice - show when user can't add connections but might have paid */}
      {!canAddMore() && connectedAccounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-medium text-amber-800">
                Just upgraded your plan?
              </p>
              <p className="text-sm text-amber-600">
                If you recently upgraded, click sync to refresh your subscription status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSyncSubscription}
            disabled={syncingSubscription}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 cursor-pointer disabled:opacity-50"
          >
            {syncingSubscription ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync
          </button>
        </div>
      )}

      {/* Upgrade CTA - only show when user has used all their connections */}
      {!canAddMore() && connectedAccounts.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Need more connections?</h3>
          <p className="text-white/80 mb-4">
            Upgrade to Professional or Enterprise to connect more data sources.
          </p>
          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
