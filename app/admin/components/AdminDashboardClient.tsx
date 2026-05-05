"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  Clock,
  UserX,
  DollarSign,
  ArrowRight,
  TrendingUp,
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

interface AdminDashboardClientProps {
  users: UserWithSubscription[];
  transactions: Transaction[];
  stats: {
    totalUsers: number;
    activeSubscriptions: number;
    trialUsers: number;
    totalRevenue: number;
    inactiveUsers: number;
  };
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="w-5 h-5 bg-gray-200 rounded" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      ))}
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
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardClient({ users, transactions, stats }: AdminDashboardClientProps) {
  const [isLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === "number" ? new Date(dateString * 1000) : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const recentUsers = users.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      {isLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Active Subs</h3>
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Trial Users</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.trialUsers}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Inactive</h3>
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Users</h2>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.full_name || "No name"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.subscriptions?.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.subscriptions?.status === "trialing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.subscriptions?.status || "No plan"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No users yet</div>
              )}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
            <Link
              href="/admin/transactions"
              className="flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.customer_name || tx.customer_email || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {tx.description || "Subscription payment"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(tx.created)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No transactions yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
