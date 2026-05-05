"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Download,
  RefreshCw,
  Loader2,
  Instagram,
  Facebook,
  Music2,
  ExternalLink,
  BarChart3,
} from "lucide-react";

interface AnalyticsData {
  hasData: boolean;
  accounts: Array<{
    id: string;
    platform: string;
    platform_username: string;
  }>;
  totals: {
    followers: number;
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    posts: number;
    engagementRate: number;
  };
  platformBreakdown: Array<{
    platform: string;
    accountId: string;
    username: string;
    followers: number;
    impressions: number;
    engagement: number;
  }>;
  topPosts: Array<{
    id: string;
    platform: string;
    type: string;
    caption: string;
    thumbnail: string;
    permalink: string;
    likes: number;
    comments: number;
    shares: number;
    views: number;
    postedAt: string;
  }>;
  recentMetrics: Array<{
    date: string;
    platform: string;
    followers: number;
    impressions: number;
    reach: number;
    likes: number;
  }>;
}

const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
};

const platformColors: Record<string, string> = {
  instagram: "from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  tiktok: "bg-black",
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("30");

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics/overview");
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Yet</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Connect your first data source and sync your data to start seeing analytics.
        </p>
        <Link
          href="/dashboard/connections"
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Connect Data Source
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Followers",
      value: formatNumber(data.totals.followers),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Total Impressions",
      value: formatNumber(data.totals.impressions),
      icon: Eye,
      color: "bg-purple-500",
    },
    {
      label: "Engagement Rate",
      value: `${data.totals.engagementRate}%`,
      icon: Heart,
      color: "bg-pink-500",
    },
    {
      label: "Total Interactions",
      value: formatNumber(data.totals.likes + data.totals.comments + data.totals.shares),
      icon: MessageCircle,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-gray-500 mt-1">
            Track your marketing performance across {data.accounts.length} connected platform{data.accounts.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg bg-white cursor-pointer"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Connected Accounts Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Connected Accounts</h3>
        <div className="flex flex-wrap gap-3">
          {data.accounts.map((account) => {
            const Icon = platformIcons[account.platform] || Instagram;
            const colorClass = platformColors[account.platform] || "bg-gray-500";
            const isGradient = colorClass.includes("from-");
            return (
              <div
                key={account.id}
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isGradient ? `bg-gradient-to-br ${colorClass}` : colorClass
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {account.platform_username || "—"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {platformLabels[account.platform] || account.platform}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Platform Breakdown & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Platform Breakdown</h3>
          <div className="space-y-3">
            {data.platformBreakdown.map((platform) => {
              const Icon = platformIcons[platform.platform] || Instagram;
              const colorClass = platformColors[platform.platform] || "bg-gray-500";
              const isGradient = colorClass.includes("from-");
              const hasSyncedData = platform.followers > 0 || platform.impressions > 0;

              return (
                <div key={platform.accountId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${isGradient ? `bg-gradient-to-br ${colorClass}` : colorClass} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{platform.username}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {platformLabels[platform.platform] || platform.platform}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasSyncedData ? (
                      <>
                        <p className="font-semibold text-gray-900">{formatNumber(platform.followers)}</p>
                        <p className="text-xs text-gray-500">followers</p>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full">
                        <RefreshCw className="w-3 h-3" />
                        Pending sync
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {data.platformBreakdown.every(p => p.followers === 0 && p.impressions === 0) && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Go to{" "}
              <Link href="/dashboard/connections" className="text-primary underline">
                Connections
              </Link>{" "}
              and click the sync icon (↻) on each account to pull in data.
            </p>
          )}
        </div>

        {/* Engagement Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Engagement Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-500" />
                <span className="text-sm text-gray-600">Likes</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data.totals.likes)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Comments</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data.totals.comments)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Shares</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data.totals.shares)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600">Views</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data.totals.views)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Content */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Top Performing Content</h3>
        </div>
        {data.topPosts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.topPosts.slice(0, 5).map((post) => {
              const Icon = platformIcons[post.platform] || Instagram;
              return (
                <div key={post.id} className="flex items-center gap-4 p-4">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {post.caption || "No caption"}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="capitalize">{post.platform}</span>
                      <span>{post.type}</span>
                      {post.postedAt && (
                        <span>{new Date(post.postedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{formatNumber(post.likes)}</p>
                      <p className="text-xs text-gray-500">likes</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{formatNumber(post.comments)}</p>
                      <p className="text-xs text-gray-500">comments</p>
                    </div>
                    {post.views > 0 && (
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{formatNumber(post.views)}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    )}
                    {post.permalink && (
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Share2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No posts synced yet. Click &quot;Refresh&quot; on your connections to sync data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
