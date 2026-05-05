"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Key,
  Trash2,
  ExternalLink,
  Check,
  AlertCircle,
  Loader2,
  Camera,
  X,
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  role: string;
}

interface Subscription {
  plan: string;
  status: string;
  billing_period: string;
  trial_end: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
}

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  subscription: Subscription | null;
}

export default function SettingsClient({ user, profile, subscription }: SettingsClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    weekly: true,
    marketing: false,
  });
  
  // Messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image must be less than 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append("file", avatarFile);
        
        const uploadRes = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          newAvatarUrl = data.url;
        } else {
          throw new Error("Failed to upload avatar");
        }
        setUploadingAvatar(false);
      }

      // Update profile
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          avatar_url: newAvatarUrl,
        }),
      });

      if (res.ok) {
        setAvatarUrl(newAvatarUrl);
        setAvatarFile(null);
        setAvatarPreview(null);
        setSuccessMessage("Profile updated successfully!");
        router.refresh();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      setErrorMessage("Failed to save profile. Please try again.");
    } finally {
      setSavingProfile(false);
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        setSuccessMessage("Password changed successfully!");
        setShowPasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      setErrorMessage("Failed to open billing portal");
    } finally {
      setManagingBilling(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/");
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      setErrorMessage("Failed to delete account. Please try again.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleNotificationChange = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });
    
    // Save to backend
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: newValue }),
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{successMessage}</p>
          <button onClick={() => setSuccessMessage("")} className="ml-auto cursor-pointer">
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{errorMessage}</p>
          <button onClick={() => setErrorMessage("")} className="ml-auto cursor-pointer">
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div 
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleAvatarClick}
              >
                {avatarPreview || avatarUrl ? (
                  <img
                    src={avatarPreview || avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-3xl font-bold text-primary">${fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  "Change Avatar"
                )}
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  defaultValue={user.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                {profile?.email_verified ? (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-500" />
                )}
              </div>
              {!profile?.email_verified && (
                <p className="text-sm text-yellow-600 mt-1">
                  Please verify your email address
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Subscription & Billing</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 capitalize">
                  {subscription?.plan || "Starter"} Plan
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    subscription?.status === "active"
                      ? "bg-green-100 text-green-700"
                      : subscription?.status === "trialing"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {subscription?.status === "trialing" ? "Trial" : subscription?.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {subscription?.status === "trialing"
                  ? `Trial ends ${formatDate(subscription?.trial_end)}`
                  : `Next billing date: ${formatDate(subscription?.current_period_end)}`}
              </p>
            </div>
            <Link
              href="/dashboard/plans"
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
            >
              {subscription?.status === "trialing" ? "Upgrade Now" : "Change Plan"}
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Billing Period</p>
                <p className="text-sm text-gray-500 capitalize">
                  {subscription?.billing_period || "Monthly"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Payment Method</p>
                <p className="text-sm text-gray-500">
                  {subscription?.stripe_customer_id ? "Card on file" : "No payment method"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={managingBilling || !subscription?.stripe_customer_id}
                className="text-sm text-primary font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {managingBilling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Manage"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: "email" as const, label: "Email notifications", description: "Receive updates about your account" },
            { key: "weekly" as const, label: "Weekly reports", description: "Get a summary of your analytics" },
            { key: "marketing" as const, label: "Marketing emails", description: "Tips and product updates" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications[item.key]}
                  onChange={() => handleNotificationChange(item.key)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Change your password</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Connected Accounts</p>
                <p className="text-sm text-gray-500">Google OAuth</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">Connected</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm">
        <div className="p-6 border-b border-red-200">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
