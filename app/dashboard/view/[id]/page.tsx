import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DashboardData {
  id: string;
  status: string;
  looker_url: string | null;
  embed_url: string | null;
  input: {
    name: string;
    email: string;
    company_name: string;
    industry: string;
    marketing_channels: string[];
    main_goals: string[];
  } | null;
}

async function getDashboard(id: string): Promise<DashboardData | null> {
  const supabase = createAdminClient();
  
  // First try to find by dashboard ID
  const { data: dashboard } = await supabase
    .from('dashboards')
    .select(`
      id,
      status,
      looker_url,
      embed_url,
      created_at,
      user_inputs (
        id,
        name,
        email,
        company_name,
        industry,
        business_size,
        monthly_revenue,
        marketing_channels,
        main_goals
      )
    `)
    .eq('id', id)
    .single();

  if (dashboard) {
    // user_inputs is an array from the relation, get the first item
    const userInput = Array.isArray(dashboard.user_inputs) 
      ? dashboard.user_inputs[0] 
      : dashboard.user_inputs;

    return {
      id: dashboard.id,
      status: dashboard.status,
      looker_url: dashboard.looker_url,
      embed_url: dashboard.embed_url,
      input: userInput ? {
        name: userInput.name,
        email: userInput.email,
        company_name: userInput.company_name,
        industry: userInput.industry,
        marketing_channels: userInput.marketing_channels,
        main_goals: userInput.main_goals,
      } : null,
    };
  }

  // If not found, try to find by input_id
  const { data: inputData } = await supabase
    .from('user_inputs')
    .select(`
      id,
      name,
      email,
      company_name,
      industry,
      business_size,
      monthly_revenue,
      marketing_channels,
      main_goals,
      status
    `)
    .eq('id', id)
    .single();

  if (inputData) {
    return {
      id: inputData.id,
      status: 'pending',
      looker_url: null,
      embed_url: null,
      input: {
        name: inputData.name,
        email: inputData.email,
        company_name: inputData.company_name,
        industry: inputData.industry,
        marketing_channels: inputData.marketing_channels,
        main_goals: inputData.main_goals,
      },
    };
  }

  return null;
}

export default async function DashboardViewPage({ params }: PageProps) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  if (!dashboard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-[#7a71eb] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                DataProFlow
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/view/${id}`}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-[#7a71eb] text-white rounded-lg font-medium hover:bg-[#6b63d9] transition-colors cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dashboard.input?.company_name || "Your"} Dashboard
              </h1>
              <p className="text-gray-600">
                {dashboard.input?.industry || "Marketing Analytics"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  dashboard.status === "generated"
                    ? "bg-green-100 text-green-700"
                    : dashboard.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {dashboard.status === "generated"
                  ? "✓ Live"
                  : dashboard.status === "pending"
                  ? "⏳ Generating..."
                  : dashboard.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboard.status === "pending" ? (
          <PendingDashboard />
        ) : dashboard.embed_url || dashboard.looker_url ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <iframe
              src={dashboard.embed_url || dashboard.looker_url || ""}
              className="w-full h-[800px] border-0"
              title="Dashboard"
              allowFullScreen
            />
          </div>
        ) : (
          <PlaceholderDashboard
            channels={dashboard.input?.marketing_channels}
            goals={dashboard.input?.main_goals}
          />
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-[#7a71eb] to-indigo-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">
            Unlock Full Analytics Power
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Create a free account to connect your real data, get AI-powered
            insights, and access advanced features.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#7a71eb] rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

// Pending Dashboard State
function PendingDashboard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
      <div className="w-20 h-20 bg-[#7a71eb]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-10 h-10 text-[#7a71eb] animate-spin" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Generating Your Dashboard
      </h2>
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        We&apos;re analyzing your data and creating personalized insights. This
        usually takes 1-2 minutes.
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-[#7a71eb] rounded-full animate-pulse" />
        <span>Processing...</span>
      </div>
    </div>
  );
}

// Placeholder Dashboard (Demo Data)
function PlaceholderDashboard({
  channels,
  goals,
}: {
  channels?: string[];
  goals?: string[];
}) {
  const stats = [
    {
      label: "Total Reach",
      value: "124.5K",
      change: "+12.3%",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Engagement Rate",
      value: "4.8%",
      change: "+0.5%",
      icon: TrendingUp,
      color: "bg-green-500",
    },
    {
      label: "Conversions",
      value: "1,234",
      change: "+8.2%",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      label: "Revenue",
      value: "$45.2K",
      change: "+15.7%",
      icon: DollarSign,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-green-600 text-sm font-medium">
                {stat.change}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Over Time
          </h3>
          <div className="h-64 bg-gradient-to-br from-[#7a71eb]/5 to-[#7a71eb]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-[#7a71eb]/40 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Connect your data to see real charts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Channel Performance
          </h3>
          <div className="space-y-4">
            {(channels || ["instagram", "facebook", "google_ads"]).map(
              (channel, index) => (
                <div key={channel} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600 capitalize">
                    {channel.replace(/_/g, " ")}
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7a71eb] rounded-full"
                      style={{ width: `${80 - index * 15}%` }}
                    />
                  </div>
                  <div className="w-12 text-sm font-medium text-gray-900">
                    {80 - index * 15}%
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Goals Section */}
      {goals && goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Business Goals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {goals.map((goal) => (
              <div
                key={goal}
                className="bg-[#7a71eb]/5 rounded-lg p-4 text-center"
              >
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {goal.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-800 font-medium">Demo Dashboard</p>
          <p className="text-yellow-700 text-sm">
            This is a preview with sample data. Create an account and connect
            your marketing platforms to see your real analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
