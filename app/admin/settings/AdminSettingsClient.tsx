"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Bell,
  Database,
  Key,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Link2,
} from "lucide-react";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

interface AdminSettingsClientProps {
  profile: Profile | null;
  stats: {
    totalUsers: number;
    totalConnections: number;
  };
}

export default function AdminSettingsClient({ profile, stats }: AdminSettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "system">("profile");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newUserSignup: true,
    subscriptionChanges: true,
    paymentAlerts: true,
    systemAlerts: true,
    weeklyReport: false,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess("Profile updated successfully");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (securityData.newPassword !== securityData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (securityData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setSuccess("Password changed successfully");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update notifications");
      }

      setSuccess("Notification settings updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "security", name: "Security", icon: Key },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "system", name: "System", icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-500 mt-1">Manage your admin account and system settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setError("");
                setSuccess("");
              }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-gray-700 capitalize">{profile?.role || "admin"}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={securityData.currentPassword}
                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
          <div className="space-y-4 max-w-md">
            {[
              { key: "newUserSignup", label: "New User Signups", desc: "Get notified when a new user signs up" },
              { key: "subscriptionChanges", label: "Subscription Changes", desc: "Get notified when users upgrade or cancel" },
              { key: "paymentAlerts", label: "Payment Alerts", desc: "Get notified about payment issues" },
              { key: "systemAlerts", label: "System Alerts", desc: "Get notified about system issues" },
              { key: "weeklyReport", label: "Weekly Report", desc: "Receive a weekly summary email" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                  onClick={() => setNotificationSettings({
                    ...notificationSettings,
                    [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings],
                  })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    notificationSettings[item.key as keyof typeof notificationSettings]
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notificationSettings[item.key as keyof typeof notificationSettings]
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleNotificationUpdate}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium text-gray-900">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-gray-900">Active Connections</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConnections}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Environment</span>
                <span className="font-medium text-gray-900">{process.env.NODE_ENV || "development"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Version</span>
                <span className="font-medium text-gray-900">1.0.0</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Database</span>
                <span className="font-medium text-green-600">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
