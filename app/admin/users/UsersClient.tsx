"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Loader2,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  Link2,
} from "lucide-react";
import { useToast } from "@/lib/toast";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  trial_end: string | null;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  connections_count: number;
  subscriptions: Subscription[] | Subscription | null;
}

interface UsersClientProps {
  users: User[];
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

function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-8" />
        </div>
      ))}
    </div>
  );
}

export default function UsersClient({ users }: UsersClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userList, setUserList] = useState(users);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmVariant: "danger" | "warning" | "primary";
    action: () => Promise<void>;
  } | null>(null);

  const filteredUsers = userList.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if dropdown should open upward
  useEffect(() => {
    if (selectedUser && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 280; // Approximate height of dropdown
      
      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }
  }, [selectedUser]);

  const handleAction = async (action: () => Promise<void>) => {
    setActionLoading("modal");
    try {
      await action();
    } finally {
      setActionLoading(null);
      setConfirmModal(null);
      setSelectedUser(null);
    }
  };

  const handleToggleActive = (user: User) => {
    const isActivating = !user.is_active;
    setConfirmModal({
      isOpen: true,
      title: isActivating ? "Activate User" : "Suspend User",
      message: isActivating
        ? `Are you sure you want to activate ${user.full_name || user.email}? They will be able to access their account again.`
        : `Are you sure you want to suspend ${user.full_name || user.email}? They will not be able to access their account.`,
      confirmText: isActivating ? "Activate" : "Suspend",
      confirmVariant: isActivating ? "primary" : "warning",
      action: async () => {
        const res = await fetch("/api/admin/users/toggle-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, isActive: isActivating }),
        });
        if (res.ok) {
          setUserList((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, is_active: isActivating } : u
            )
          );
          showToast("success", isActivating ? "User activated successfully" : "User suspended successfully");
        } else {
          showToast("error", "Failed to update user status");
        }
      },
    });
    setSelectedUser(null);
  };

  const handleMakeAdmin = (user: User) => {
    const isRemovingAdmin = user.role === "admin";
    setConfirmModal({
      isOpen: true,
      title: isRemovingAdmin ? "Remove Admin Role" : "Make Admin",
      message: isRemovingAdmin
        ? `Are you sure you want to remove admin privileges from ${user.full_name || user.email}?`
        : `Are you sure you want to make ${user.full_name || user.email} an admin? They will have full access to the admin panel.`,
      confirmText: isRemovingAdmin ? "Remove Admin" : "Make Admin",
      confirmVariant: isRemovingAdmin ? "warning" : "primary",
      action: async () => {
        const res = await fetch("/api/admin/users/make-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, makeAdmin: !isRemovingAdmin }),
        });
        if (res.ok) {
          setUserList((prev) =>
            prev.map((u) =>
              u.id === user.id ? { ...u, role: isRemovingAdmin ? "user" : "admin" } : u
            )
          );
          showToast("success", isRemovingAdmin ? "Admin role removed successfully" : "User is now an admin");
        } else {
          showToast("error", "Failed to update user role");
        }
      },
    });
    setSelectedUser(null);
  };

  const handleUpgradePlan = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: "Upgrade Plan",
      message: `Are you sure you want to upgrade ${user.full_name || user.email} to the Professional plan?`,
      confirmText: "Upgrade",
      confirmVariant: "primary",
      action: async () => {
        const res = await fetch(`/api/admin/users/${user.id}/subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upgrade", plan: "professional" }),
        });
        if (res.ok) {
          router.refresh();
          showToast("success", "User upgraded to Professional plan");
        } else {
          showToast("error", "Failed to upgrade user plan");
        }
      },
    });
    setSelectedUser(null);
  };

  const handleDowngradePlan = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: "Downgrade Plan",
      message: `Are you sure you want to downgrade ${user.full_name || user.email} to the Starter plan?`,
      confirmText: "Downgrade",
      confirmVariant: "warning",
      action: async () => {
        const res = await fetch(`/api/admin/users/${user.id}/subscription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "downgrade", plan: "starter" }),
        });
        if (res.ok) {
          router.refresh();
          showToast("success", "User downgraded to Starter plan");
        } else {
          showToast("error", "Failed to downgrade user plan");
        }
      },
    });
    setSelectedUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete User",
      message: `Are you sure you want to permanently delete ${user.full_name || user.email}? This action cannot be undone and all their data will be lost.`,
      confirmText: "Delete User",
      confirmVariant: "danger",
      action: async () => {
        const res = await fetch(`/api/admin/users/${user.id}/delete`, {
          method: "POST",
        });
        if (res.ok) {
          setUserList((prev) => prev.filter((u) => u.id !== user.id));
          showToast("success", "User deleted successfully");
        } else {
          showToast("error", "Failed to delete user");
        }
      },
    });
    setSelectedUser(null);
  };

  // Helper to get subscription (handles both array and single object)
  const getSubscription = (user: User): Subscription | null => {
    if (!user.subscriptions) return null;
    if (Array.isArray(user.subscriptions)) {
      return user.subscriptions[0] || null;
    }
    return user.subscriptions;
  };

  const getStatusBadge = (user: User) => {
    const sub = getSubscription(user);
    if (!sub) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          No Plan
        </span>
      );
    }
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      trialing: "bg-blue-100 text-blue-700",
      canceled: "bg-gray-100 text-gray-700",
      past_due: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${colors[sub.status] || "bg-gray-100 text-gray-700"}`}
      >
        {sub.status}
      </span>
    );
  };

  const getPlanBadge = (user: User) => {
    const sub = getSubscription(user);
    if (!sub || !sub.plan) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
          No Plan
        </span>
      );
    }
    const planColors: Record<string, string> = {
      starter: "bg-blue-100 text-blue-700",
      professional: "bg-purple-100 text-purple-700",
      enterprise: "bg-amber-100 text-amber-700",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${planColors[sub.plan] || "bg-gray-100 text-gray-700"}`}>
        {sub.plan}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">
            Manage all {userList.length} users in the system
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <TableSkeleton />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={(e) => {
                      // Don't navigate if clicking on the actions dropdown
                      if ((e.target as HTMLElement).closest('[data-actions]')) return;
                      router.push(`/admin/users/${user.id}`);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name || "No name"}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            {user.email}
                            {user.email_verified && (
                              <UserCheck className="w-3 h-3 text-green-500" />
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getPlanBadge(user)}</td>
                    <td className="px-6 py-4">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{user.connections_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <UserX className="w-3 h-3" />
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4" data-actions>
                      <div className="relative flex justify-end" ref={selectedUser === user.id ? dropdownRef : null}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(selectedUser === user.id ? null : user.id);
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {selectedUser === user.id && (
                          <div 
                            className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${
                              dropdownPosition === "top" || index >= filteredUsers.length - 2
                                ? "bottom-full mb-1" 
                                : "top-full mt-1"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleUpgradePlan(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <TrendingUp className="w-4 h-4 text-green-500" />
                              Upgrade Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDowngradePlan(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <TrendingDown className="w-4 h-4 text-orange-500" />
                              Downgrade Plan
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
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
                            <button
                              type="button"
                              onClick={() => handleMakeAdmin(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Shield className="w-4 h-4 text-primary" />
                              {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No users found matching your search.
          </div>
        )}
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
          onCancel={() => {
            setConfirmModal(null);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Click outside to close dropdown */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
