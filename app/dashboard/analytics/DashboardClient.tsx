"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Eye,
  Heart,
  TrendingUp,
  MessageCircle,
  RefreshCw,
  Loader2,
  Instagram,
  Facebook,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  Share2,
} from "lucide-react";
import AIChatWidget from "../components/AIChatWidget";

interface DashboardData {
  hasData: boolean;
  accounts: Array<{
    id: string;
    platform: string;
    platform_username: string;
  }>;
  totals: {
    followers: number;
    newFollowers: number;
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
  dailyData: Array<{
    date: string;
    followers: number;
    impressions: number;
    engagement: number;
  }>;
  topPosts: Array<{
    id: string;
    platform: string;
    type: string;
    caption: string;
    mediaUrl?: string;
    likes: number;
    comments: number;
    views: number;
    permalink?: string;
    postedAt: string;
  }>;
}

export default function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(7);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/windsor/data?days=${dateRange}`);
      const result = await res.json();
      
      if (result.error) {
        setError(result.error);
        // Use demo data if API fails
        setData(getDemoData());
      } else {
        setData(result);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load data. Using demo data.");
      setData(getDemoData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const getDemoData = (): DashboardData => ({
    hasData: true,
    accounts: [
      { id: "1", platform: "instagram", platform_username: "your_business" },
      { id: "2", platform: "facebook", platform_username: "Your Business Page" },
    ],
    totals: {
      followers: 387,
      newFollowers: 227,
      impressions: 116500,
      reach: 85000,
      likes: 1500,
      comments: 320,
      shares: 180,
      views: 45000,
      posts: 12,
      engagementRate: 4.2,
    },
    platformBreakdown: [
      { platform: "instagram", accountId: "1", username: "your_business", followers: 287, impressions: 85000, engagement: 4.5 },
      { platform: "facebook", accountId: "2", username: "Your Business Page", followers: 100, impressions: 31500, engagement: 3.8 },
    ],
    dailyData: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      followers: 300 + i * 12,
      impressions: 15000 + Math.random() * 5000,
      engagement: 3 + Math.random() * 2,
    })),
    topPosts: [],
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const stats = data?.totals || getDemoData().totals;

  const statCards = [
    {
      label: "Total Followers",
      value: stats.followers,
      change: `+${stats.newFollowers}`,
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Impressions",
      value: stats.impressions,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Eye,
      color: "bg-purple-500",
    },
    {
      label: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      change: "+0.8%",
      changeType: "positive" as const,
      icon: Heart,
      color: "bg-pink-500",
    },
    {
      label: "Total Reach",
      value: stats.reach,
      change: "+8.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Track your social media performance across all platforms
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">
                {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {(data?.dailyData || getDemoData().dailyData).map((day, i) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${(day.impressions / 20000) * 100}px` }}
                    />
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${(day.followers / 400) * 100}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span className="text-sm text-gray-600">Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/20 rounded" />
                <span className="text-sm text-gray-600">Impressions</span>
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Platform Breakdown</h3>
            <div className="space-y-4">
              {(data?.platformBreakdown || getDemoData().platformBreakdown).map((platform) => (
                <div key={platform.platform} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {platform.platform === "instagram" ? (
                      <Instagram className="w-5 h-5 text-pink-600" />
                    ) : platform.platform === "facebook" ? (
                      <Facebook className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Share2 className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 capitalize">
                        {platform.platform}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(platform.impressions)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((platform.impressions / 100000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Connected Accounts</h4>
              <div className="space-y-2">
                {(data?.accounts || getDemoData().accounts).map((account) => (
                  <div key={account.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-gray-600">{account.platform_username}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 capitalize">{account.platform}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.likes)}</p>
              <p className="text-sm text-gray-600">Likes</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.comments)}</p>
              <p className="text-sm text-gray-600">Comments</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Share2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.shares)}</p>
              <p className="text-sm text-gray-600">Shares</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        {!data?.hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5">⚠️</div>
            <div>
              <p className="text-yellow-800 font-medium">Demo Data</p>
              <p className="text-yellow-700 text-sm">
                You&apos;re viewing sample data. Connect your Instagram/Facebook accounts in the 
                <a href="/dashboard/connections" className="underline font-medium">Connections</a> page to see your real analytics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Widget */}
      <AIChatWidget
        dashboardContext={{
          followers: stats.followers,
          impressions: stats.impressions,
          engagement: stats.engagementRate,
          platform: data?.platformBreakdown?.[0]?.platform || "Instagram",
        }}
      />
    </div>
  );
}
