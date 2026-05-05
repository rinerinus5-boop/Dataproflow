import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Analytics | Admin Dashboard",
  description: "Platform-wide analytics for DataProFlow.",
};

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  // Get total metrics
  const { data: metrics } = await supabase
    .from("platform_metrics")
    .select("*")
    .order("metric_date", { ascending: false })
    .limit(100);

  // Calculate totals
  let totalFollowers = 0;
  let totalImpressions = 0;
  let totalLikes = 0;

  const accountMetrics = new Map();
  for (const metric of metrics || []) {
    if (!accountMetrics.has(metric.connected_account_id)) {
      accountMetrics.set(metric.connected_account_id, metric);
      totalFollowers += metric.followers_count || 0;
      totalImpressions += metric.total_impressions || 0;
      totalLikes += metric.total_likes || 0;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 mt-1">
          View analytics across all users and connections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Followers (All Users)</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalFollowers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Impressions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalImpressions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Engagement</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {totalLikes.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Metrics</h2>
        {metrics && metrics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Platform</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Followers</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Impressions</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Likes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.slice(0, 20).map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{m.metric_date}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{m.platform}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{m.followers_count?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{m.total_impressions?.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{m.total_likes?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No metrics data available yet.</p>
        )}
      </div>
    </div>
  );
}
