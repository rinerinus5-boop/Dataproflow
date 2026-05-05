"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User, Mail, Video, ExternalLink, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
interface Booking {
  id: string;
  guest_name: string;
  guest_email: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  subject: string;
  description: string;
  status: string;
  google_meet_link: string | null;
  google_event_id: string | null;
  created_at: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("upcoming");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/bookings?filter=${filter}`);
      const data = await response.json();

      if (data.error) {
        console.error("Error fetching bookings:", data.error);
      } else {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setIsLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error updating booking:", data.error);
      } else {
        await fetchBookings();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
    setIsUpdating(false);
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("Error deleting booking:", data.error);
        alert("Failed to delete booking: " + data.error);
      } else {
        await fetchBookings();
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
    setIsUpdating(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no_show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const upcomingCount = bookings.filter(
    (b) => b.status === "scheduled" && b.booking_date >= new Date().toISOString().split("T")[0]
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1">
            Manage your scheduled calls and meetings
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "completed").length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "cancelled").length}
              </p>
              <p className="text-sm text-gray-500">Cancelled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.google_meet_link).length}
              </p>
              <p className="text-sm text-gray-500">With Meet Link</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["upcoming", "all", "past", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {booking.guest_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {booking.guest_email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.subject}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.booking_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedBooking.guest_name}
                  </h3>
                  <a
                    href={`mailto:${selectedBooking.guest_email}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {selectedBooking.guest_email}
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {formatDate(selectedBooking.booking_date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {formatTime(selectedBooking.start_time)} -{" "}
                    {formatTime(selectedBooking.end_time)}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 mt-0.5">📝</span>
                  <span className="text-gray-900">{selectedBooking.subject}</span>
                </div>
                {selectedBooking.description && (
                  <div className="flex items-start gap-3">
                    <span className="text-gray-400 mt-0.5">💬</span>
                    <span className="text-gray-600">
                      {selectedBooking.description}
                    </span>
                  </div>
                )}
              </div>

              {selectedBooking.google_meet_link && (
                <a
                  href={selectedBooking.google_meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <Video className="w-5 h-5" />
                  Join Google Meet
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              {selectedBooking.status === "scheduled" && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() =>
                      updateBookingStatus(selectedBooking.id, "completed")
                    }
                    disabled={isUpdating}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Mark Completed"
                    )}
                  </button>
                  <button
                    onClick={() =>
                      updateBookingStatus(selectedBooking.id, "cancelled")
                    }
                    disabled={isUpdating}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => deleteBooking(selectedBooking.id)}
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Appointment
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Booked on{" "}
                {new Date(selectedBooking.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
