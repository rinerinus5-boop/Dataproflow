"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, ArrowLeft, Loader2, CheckCircle, Video } from "lucide-react";

interface BookCallFormProps {
  defaultName?: string;
  defaultEmail?: string;
  ticketId?: string;
  conversationId?: string;
  onComplete: (booking: BookingResult) => void;
  onCancel: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingResult {
  id: string;
  date: string;
  time: string;
  meetLink?: string;
}

export default function BookCallForm({
  defaultName = "",
  defaultEmail = "",
  ticketId,
  conversationId,
  onComplete,
  onCancel,
}: BookCallFormProps) {
  const [step, setStep] = useState<"date" | "time" | "details" | "confirm">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);

  // Get next 14 days for date selection
  const getAvailableDates = () => {
    const dates: { date: string; label: string; dayName: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      dates.push({
        date: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    
    return dates;
  };

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;

    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/bookings?date=${selectedDate}`);
        const data = await response.json();
        
        if (data.slots) {
          setTimeSlots(data.slots);
        } else {
          setTimeSlots([]);
          if (data.message) {
            setError(data.message);
          }
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load available times");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!name || !email || !selectedDate || !selectedTime) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: name,
          guestEmail: email,
          date: selectedDate,
          time: selectedTime,
          subject: subject || "Support Call with DataProFlow",
          description,
          ticketId,
          conversationId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      setBookingResult({
        id: data.booking.id,
        date: selectedDate,
        time: selectedTime,
        meetLink: data.booking.google_meet_link,
      });
      setStep("confirm");

    } catch (err) {
      console.error("Error creating booking:", err);
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const availableDates = getAvailableDates();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-gray-50">
        <div className="flex items-center gap-3">
          {step !== "date" && step !== "confirm" && (
            <button
              onClick={() => {
                if (step === "time") setStep("date");
                else if (step === "details") setStep("time");
              }}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              {step === "confirm" ? "Booking Confirmed!" : "Book a Call"}
            </h3>
            <p className="text-xs text-gray-500">
              {step === "date" && "Select a date"}
              {step === "time" && "Select a time"}
              {step === "details" && "Enter your details"}
              {step === "confirm" && "Your call has been scheduled"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Date Selection */}
        {step === "date" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Select a date for your call</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => handleDateSelect(d.date)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedDate === d.date
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                  }`}
                >
                  <p className="text-xs text-gray-500">{d.dayName}</p>
                  <p className="font-medium">{d.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {step === "time" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Clock className="w-4 h-4" />
              <span>
                Available times for{" "}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No available times for this date</p>
                <button
                  onClick={() => setStep("date")}
                  className="mt-2 text-primary text-sm hover:underline cursor-pointer"
                >
                  Choose another date
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-2.5 rounded-xl border text-sm transition-all cursor-pointer ${
                      !slot.available
                        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : selectedTime === slot.time
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"
                    }`}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Details Form */}
        {step === "details" && (
          <div className="space-y-4">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-sm font-medium text-primary">
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {formatTime(selectedTime)}
              </p>
              <p className="text-xs text-gray-500 mt-1">30 minute video call</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="w-4 h-4 inline mr-1" />
                Your Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Your Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject (optional)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Details (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any specific questions or topics..."
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Confirmation */}
        {step === "confirm" && bookingResult && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              You&apos;re all set!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your call has been scheduled for{" "}
              <strong>
                {new Date(bookingResult.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </strong>{" "}
              at <strong>{formatTime(bookingResult.time)}</strong>
            </p>

            {bookingResult.meetLink && (
              <a
                href={bookingResult.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4" />
                Join Google Meet
              </a>
            )}

            <p className="text-xs text-gray-500 mt-4">
              A calendar invite has been sent to your email
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {step !== "confirm" && (
        <div className="p-4 border-t border-border bg-white">
          {step === "details" ? (
            <button
              onClick={handleSubmit}
              disabled={!name || !email || isSubmitting}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {step === "confirm" && (
        <div className="p-4 border-t border-border bg-white">
          <button
            onClick={() => onComplete(bookingResult!)}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
