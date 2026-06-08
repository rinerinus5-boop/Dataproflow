"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Eye,
  Check,
  X,
  RefreshCw,
  Mail,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface UserReport {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  weekOf: string;
  metrics: {
    followers: number;
    newFollowers: number;
    impressions: number;
    reactions: number;
    engagementRate: number;
  };
  summary: string;
  status: "draft" | "approved" | "sent" | "skipped";
  dashboardUrl: string;
}

export default function WeeklyReportsAdminPage() {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [editingSummary, setEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/weekly-reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      // Use demo data if API fails
      setReports(getDemoReports());
    } finally {
      setLoading(false);
    }
  };

  const generateReports = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/weekly-reports?generate=true", {
        method: "POST",
      });
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Failed to generate reports:", error);
    } finally {
      setGenerating(false);
    }
  };

  const getDemoReports = (): UserReport[] => [
    {
      id: "demo-1",
      userId: "user-1",
      userName: "John Smith",
      userEmail: "john@example.com",
      weekOf: new Date().toISOString().split("T")[0],
      metrics: {
        followers: 387,
        newFollowers: 227,
        impressions: 116500,
        reactions: 1500,
        engagementRate: 4.2,
      },
      summary: "Hi John, here's your weekly social media summary! You now have 387 followers (+227 new this week!). Your content reached 116,500 people and received 1,500 reactions. Great job! Your engagement rate of 4.2% is above average.",
      status: "draft",
      dashboardUrl: "https://www.dataproflow.com/dashboard/analytics",
    },
    {
      id: "demo-2",
      userId: "user-2",
      userName: "Sarah Johnson",
      userEmail: "sarah@example.com",
      weekOf: new Date().toISOString().split("T")[0],
      metrics: {
        followers: 1250,
        newFollowers: 89,
        impressions: 45000,
        reactions: 680,
        engagementRate: 2.8,
      },
      summary: "Hi Sarah, here's your weekly summary! You gained 89 new followers this week, bringing your total to 1,250. Your posts received 45,000 impressions and 680 reactions. Your engagement rate is 2.8%. Consider posting more video content to boost engagement!",
      status: "draft",
      dashboardUrl: "https://www.dataproflow.com/dashboard/analytics",
    },
  ];

  const approveAndSend = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setSending(reportId);
    try {
      const res = await fetch("/api/admin/weekly-reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          userEmail: report.userEmail,
          userName: report.userName,
          summary: report.summary,
          metrics: report.metrics,
          dashboardUrl: report.dashboardUrl,
          weekOf: report.weekOf,
        }),
      });

      if (res.ok) {
        setReports(reports.map((r) =>
          r.id === reportId ? { ...r, status: "sent" as const } : r
        ));
      }
    } catch (error) {
      console.error("Failed to send report:", error);
    } finally {
      setSending(null);
    }
  };

  const skipReport = (reportId: string) => {
    setReports(reports.map((r) =>
      r.id === reportId ? { ...r, status: "skipped" as const } : r
    ));
  };

  const updateSummary = (reportId: string, newSummary: string) => {
    setReports(reports.map((r) =>
      r.id === reportId ? { ...r, summary: newSummary } : r
    ));
    setEditingSummary(false);
  };

  const pendingCount = reports.filter((r) => r.status === "draft").length;
  const sentCount = reports.filter((r) => r.status === "sent").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekly Reports</h1>
        <p className="text-gray-600">
          Review and approve weekly email reports before sending to users.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{sentCount}</p>
              <p className="text-sm text-gray-600">Sent This Week</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Week of</p>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={generateReports}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            Generate Reports
          </button>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={() => {
              reports
                .filter((r) => r.status === "draft")
                .forEach((r) => approveAndSend(r.id));
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Send All ({pendingCount})
          </button>
        )}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Yet</h3>
          <p className="text-gray-600 mb-4">
            Weekly reports will appear here every Monday for review.
          </p>
          <button
            onClick={() => setReports(getDemoReports())}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Load Demo Reports
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.userName}</h3>
                    <p className="text-sm text-gray-600">{report.userEmail}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : report.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {report.status === "draft" ? (
                      <Clock className="w-3 h-3" />
                    ) : report.status === "sent" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {report.status === "draft"
                      ? "Pending"
                      : report.status === "sent"
                      ? "Sent"
                      : "Skipped"}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Followers</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {report.metrics.followers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">New Followers</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{report.metrics.newFollowers.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Impressions</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {report.metrics.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Reactions</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {report.metrics.reactions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Engagement</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {report.metrics.engagementRate}%
                    </p>
                  </div>
                </div>

                {/* Email Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Email Preview:</p>
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setEditedSummary(report.summary);
                        setEditingSummary(true);
                      }}
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{report.summary}</p>
                  <p className="text-sm text-primary mt-2">
                    → View dashboard: {report.dashboardUrl}
                  </p>
                </div>

                {/* Actions */}
                {report.status === "draft" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => approveAndSend(report.id)}
                      disabled={sending === report.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {sending === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Approve & Send
                    </button>
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => skipReport(report.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Skip
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Summary Modal */}
      {editingSummary && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Email Summary</h3>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingSummary(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => updateSummary(selectedReport.id, editedSummary)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
