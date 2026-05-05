import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Connections | Admin Dashboard",
  description: "View all user connections in DataProFlow.",
};

export default async function ConnectionsPage() {
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from("connected_accounts")
    .select(`
      *,
      profiles (
        id,
        email,
        full_name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Connections</h1>
        <p className="text-gray-500 mt-1">
          View all connected accounts across all users
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Connected
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {connections?.map((conn) => (
              <tr key={conn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {conn.profiles?.full_name || "No name"}
                    </p>
                    <p className="text-sm text-gray-500">{conn.profiles?.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize font-medium text-gray-900">
                    {conn.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-900">{conn.platform_username || conn.platform_user_id}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      conn.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {conn.is_active ? "Active" : "Disconnected"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(conn.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!connections || connections.length === 0) && (
          <div className="p-8 text-center text-gray-500">
            No connections found.
          </div>
        )}
      </div>
    </div>
  );
}
