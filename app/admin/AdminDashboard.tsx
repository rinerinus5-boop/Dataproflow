"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CreditCard,
  Clock,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  Download,
  DollarSign,
  Receipt,
} from "lucide-react";

interface UserWithSubscription {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  subscriptions: {
    plan: string;
    status: string;
    billing_period: string;
    trial_end: string | null;
    stripe_customer_id: string | null;
  } | null;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer_email: string;
  customer_name: string | null;
  description: string | null;
}

interface AdminDashboardProps {
  users: UserWithSubscription[];
  transactions: Transaction[];
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    trialUsers: number;
    totalRevenue: number;
  };
}

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Transactions", href: "/admin/transactions", icon: Receipt },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminDashboard({ users, transactions, stats }: AdminDashboardProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "transactions">("users");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const handleUserAction = async (userId: string, action: string, data?: any) => {
    setActionLoading(`${userId}-${action}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data || {}),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    } finally {
      setActionLoading(null);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || user.subscriptions?.status === statusFilter;
    
    const matchesPlan =
      planFilter === "all" || user.subscriptions?.plan === planFilter;
    
    const matchesActive =
      activeFilter === "all" ||
      (activeFilter === "active" && user.is_active) ||
      (activeFilter === "inactive" && !user.is_active);
    
    return matchesSearch && matchesStatus && matchesPlan && matchesActive;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      trialing: "bg-blue-100 text-blue-700",
      active: "bg-green-100 text-green-700",
      canceled: "bg-gray-100 text-gray-700",
      past_due: "bg-red-100 text-red-700",
      unpaid: "bg-yellow-100 text-yellow-700",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a2e] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Admin Panel</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/60 hover:text-white cursor-pointer"
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
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Back to Dashboard */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground mt-1">Registered accounts</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
                <CreditCard className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.activeSubscriptions}</p>
              <p className="text-sm text-muted-foreground mt-1">Paying customers</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Trial Users</h3>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.trialUsers}</p>
              <p className="text-sm text-muted-foreground mt-1">In free trial</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-border gap-4">
              <h2 className="text-lg font-semibold text-foreground">All Users</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-secondary/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {user.full_name || "No name"}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground capitalize">
                          {user.subscriptions?.plan || "None"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.subscriptions ? (
                          getStatusBadge(user.subscriptions.status)
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {selectedUser === user.id && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border z-10">
                              <div className="px-4 py-2 border-b border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Manage Plan</p>
                              </div>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer"
                                onClick={() => setSelectedUser(null)}
                              >
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Upgrade Plan
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer"
                                onClick={() => setSelectedUser(null)}
                              >
                                <TrendingDown className="w-4 h-4 text-orange-500" />
                                Downgrade Plan
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer"
                                onClick={() => setSelectedUser(null)}
                              >
                                <RefreshCw className="w-4 h-4 text-blue-500" />
                                Reset Trial
                              </button>
                              <div className="px-4 py-2 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase">Account</p>
                              </div>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-foreground hover:bg-secondary cursor-pointer"
                                onClick={() => setSelectedUser(null)}
                              >
                                <Shield className="w-4 h-4" />
                                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                onClick={() => setSelectedUser(null)}
                              >
                                <Ban className="w-4 h-4" />
                                Cancel Subscription
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
