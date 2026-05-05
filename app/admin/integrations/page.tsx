"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, AlertCircle, RefreshCw, ExternalLink, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GoogleCalendarStatus {
  isConnected: boolean;
  email?: string;
  connectedAt?: string;
}

export default function AdminIntegrationsPage() {
  const [calendarStatus, setCalendarStatus] = useState<GoogleCalendarStatus>({
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Check if admin has Google Calendar tokens
      const { data: tokens } = await supabase
        .from("google_calendar_tokens")
        .select("created_at")
        .eq("user_id", user.id)
        .single();

      setCalendarStatus({
        isConnected: !!tokens,
        connectedAt: tokens?.created_at,
      });
    } catch (error) {
      console.error("Error checking calendar status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCalendar = () => {
    setIsConnecting(true);
    // Redirect to Google OAuth
    window.location.href = "/api/auth/google?redirect=/admin/integrations";
  };

  const handleDisconnectCalendar = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Delete Google Calendar tokens
      await supabase
        .from("google_calendar_tokens")
        .delete()
        .eq("user_id", user.id);

      setCalendarStatus({ isConnected: false });
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Connect external services to enhance your workflow
        </p>
      </div>

      {/* Google Calendar Integration */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Google Calendar
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically create calendar events for new bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {calendarStatus.isConnected ? (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Not Connected
                </span>
              )}
            </div>
          </div>

          <div className="mt-6">
            {calendarStatus.isConnected ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Google Calendar is connected
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        New bookings will automatically be added to your calendar
                      </p>
                      {calendarStatus.connectedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Connected on {new Date(calendarStatus.connectedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Calendar events will be created for all new bookings
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Events include Google Meet links for video calls
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnectCalendar}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        Connect your Google Calendar
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Enable automatic calendar event creation for new bookings
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Benefits:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Automatic event creation for new bookings
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Google Meet links generated automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Sync with your existing calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      Email notifications with calendar invites
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleConnectCalendar}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Connect Google Calendar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* How it works */}
        {!calendarStatus.isConnected && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">How it works:</h4>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                  1
                </span>
                <span>Click "Connect Google Calendar" to authorize access</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                  2
                </span>
                <span>Sign in with your Google account and grant permissions</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                  3
                </span>
                <span>New bookings will automatically create calendar events</span>
              </li>
            </ol>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Admin Settings
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Calendar integration is available for admin users only. Make sure you're logged in as an admin to connect your Google Calendar.
            </p>
            <div className="mt-3">
              <a
                href="https://support.google.com/calendar/answer/60635?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
              >
                Learn more about Google Calendar
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
