"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Bell,
  UserPlus,
  DollarSign,
  XCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  CalendarDays,
  Plug,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile, AdminNotification } from "@/lib/types/database";
import DashboardBreadcrumb from "@/app/components/ui/DashboardBreadcrumb";

interface Booking {
  id: string;
  status: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  guest_name: string;
  guest_email: string;
  subject: string;
  description?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: Profile | null;
}

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Support Tickets", href: "/admin/support", icon: MessageSquare },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { name: "Integrations", href: "/admin/integrations", icon: Plug },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
  user,
  profile,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const [upcomingBookingsCount, setUpcomingBookingsCount] = useState(0);

  // Fetch notifications and open ticket count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications?limit=10");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    const fetchOpenTickets = async () => {
      try {
        const res = await fetch("/api/admin/tickets?status=open");
        if (res.ok) {
          const data = await res.json();
          setOpenTicketCount(data.tickets?.length || 0);
        }
      } catch (error) {
        console.error("Failed to fetch open tickets:", error);
      }
    };

    const fetchUpcomingBookings = async () => {
      try {
        // Only count scheduled (upcoming) appointments
        const res = await fetch("/api/admin/bookings?filter=upcoming");
        if (res.ok) {
          const data = await res.json();
          // Filter to only count scheduled appointments
          const scheduledBookings = data.bookings?.filter((booking: Booking) => booking.status === 'scheduled') || [];
          setUpcomingBookingsCount(scheduledBookings.length);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming bookings:", error);
      }
    };

    fetchNotifications();
    fetchOpenTickets();
    fetchUpcomingBookings();
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchOpenTickets();
      fetchUpcomingBookings();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (ids?: string[]) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ids ? { notificationIds: ids } : { markAllRead: true }),
      });
      if (ids) {
        setNotifications(prev => 
          prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - ids.length));
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_registration": return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "subscription_created": return <DollarSign className="w-4 h-4 text-green-500" />;
      case "subscription_cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      case "subscription_upgraded": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "subscription_downgraded": return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case "payment_failed": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const showBadge = (item.name === "Support" && openTicketCount > 0) || (item.name === "Bookings" && upcomingBookingsCount > 0);
              const badgeCount = item.name === "Support" ? openTicketCount : item.name === "Bookings" ? upcomingBookingsCount : 0;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  {showBadge && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Admin Info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                Admin Panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAsRead()}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.is_read && markAsRead([notification.id])}
                          className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                            !notification.is_read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.full_name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggingOut) {
                        handleLogout();
                      }
                    }}
                    disabled={isLoggingOut}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 ${isLoggingOut ? 'opacity-50' : ''}`}
                  >
                    <LogOut className="w-4 h-4" />
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <DashboardBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
