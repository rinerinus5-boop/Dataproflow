import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Link2,
  Clock,
  Plus,
  ChevronRight,
  Users,
  Eye,
  Heart,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | DataProFlow",
  description: "Your DataProFlow dashboard - View and manage your marketing data.",
};

const platformIcons: Record<string, string> = {
  instagram: "📸",
  facebook: "📘",
  tiktok: "🎵",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch subscription
  // Note: profile is fetched in DashboardLayout already

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  // Fetch connected accounts
  const { data: connectedAccounts } = await supabase
    .from("connected_accounts")
    .select("*")
    .eq("user_id", user?.id)
    .eq("is_active", true);

  // Fetch latest metrics for overview
  const { data: latestMetrics } = await supabase
    .from("platform_metrics")
    .select("*")
    .eq("user_id", user?.id)
    .order("metric_date", { ascending: false })
    .limit(10);

  // Calculate totals from latest metrics (one per account)
  const accountMetrics = new Map();
  for (const metric of latestMetrics || []) {
    if (!accountMetrics.has(metric.connected_account_id)) {
      accountMetrics.set(metric.connected_account_id, metric);
    }
  }

  let totalFollowers = 0;
  let totalImpressions = 0;
  let totalLikes = 0;

  for (const [, metric] of accountMetrics) {
    totalFollowers += metric.followers_count || 0;
    totalImpressions += metric.total_impressions || 0;
    totalLikes += metric.total_likes || 0;
  }

  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end) return null;
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  return (
    <>
      {/* Trial Banner */}
      {subscription?.status === "trialing" && getTrialDaysLeft() !== null && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              <span className="font-medium">{getTrialDaysLeft()} days left</span> in your free trial.
              Upgrade now to continue accessing your data.
            </p>
          </div>
          <Link
            href="/dashboard/plans"
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Connected Accounts</h3>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{connectedAccounts?.length || 0}</p>
          <p className="text-sm text-gray-500 mt-1">
            of {subscription?.plan === "enterprise" ? "unlimited" : subscription?.plan === "professional" ? "5" : "1"} accounts
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Followers</h3>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalFollowers)}</p>
          <p className="text-sm text-gray-500 mt-1">across all platforms</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Impressions</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalImpressions)}</p>
          <p className="text-sm text-gray-500 mt-1">this period</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalLikes)}</p>
          <p className="text-sm text-gray-500 mt-1">likes & reactions</p>
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
          <Link
            href="/dashboard/connections"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Connection
          </Link>
        </div>

        {connectedAccounts && connectedAccounts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {connectedAccounts.map((account: { id: string; platform: string; platform_username: string | null }) => (
              <div key={account.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platformIcons[account.platform]}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {account.platform_username || account.platform}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{account.platform}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
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
    </>
  );
}
