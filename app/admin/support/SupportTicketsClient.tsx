"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Calendar,
  ExternalLink,
  Loader2,
  FileText,
} from "lucide-react";

interface ConversationMessage {
  id: string;
  content: string;
  sender_type: string;
  created_at: string;
}

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  help_type: string;
  destination: string | null;
  data_source: string | null;
  user_name: string;
  user_email: string;
  priority: string;
  status: string;
  meeting_link: string | null;
  meeting_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
  } | null;
  support_conversations: {
    id: string;
    support_messages: ConversationMessage[];
  } | null;
}

interface SupportTicketsClientProps {
  tickets: Ticket[];
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  waiting_for_customer: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600",
};

export default function SupportTicketsClient({ tickets: initialTickets }: SupportTicketsClientProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });

      if (response.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Generate chat summary from messages
  const getChatSummary = (ticket: Ticket) => {
    const messages = ticket.support_conversations?.support_messages || [];
    if (messages.length === 0) return null;
    
    // Get user messages for context
    const userMessages = messages.filter(m => m.sender_type === 'user');
    if (userMessages.length === 0) return null;
    
    // Return first user message as the main query
    return {
      mainQuery: userMessages[0]?.content || '',
      totalMessages: messages.length,
      userMessages: userMessages.length,
      aiMessages: messages.filter(m => m.sender_type === 'ai').length,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and respond to customer support requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting_for_customer">Waiting for Customer</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTicket?.id === ticket.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[ticket.status] || statusColors.open
                        }`}
                      >
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityColors[ticket.priority] || priorityColors.normal
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">
                      {ticket.subject}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {ticket.user_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {ticket.user_email}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(ticket.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-gray-500">
                  {selectedTicket.ticket_number}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[selectedTicket.status] || statusColors.open
                  }`}
                >
                  {getStatusIcon(selectedTicket.status)}
                  {selectedTicket.status.replace(/_/g, " ")}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedTicket.subject}
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{selectedTicket.user_name}</p>
                  <p className="text-gray-600">{selectedTicket.user_email}</p>
                </div>

                {selectedTicket.destination && (
                  <div>
                    <p className="text-gray-500 mb-1">Destination</p>
                    <p className="font-medium text-gray-900">{selectedTicket.destination}</p>
                  </div>
                )}

                {selectedTicket.data_source && (
                  <div>
                    <p className="text-gray-500 mb-1">Data Source</p>
                    <p className="font-medium text-gray-900">{selectedTicket.data_source}</p>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 mb-1">Created</p>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedTicket.created_at)}
                  </p>
                </div>

                {selectedTicket.meeting_link && (
                  <div>
                    <p className="text-gray-500 mb-1">Meeting</p>
                    <a
                      href={selectedTicket.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>

              {/* Chat Summary */}
              {getChatSummary(selectedTicket) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium text-gray-900">Chat Summary</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">User&apos;s Query</p>
                      <p className="text-sm text-gray-900 line-clamp-3">
                        {getChatSummary(selectedTicket)?.mainQuery}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        {getChatSummary(selectedTicket)?.totalMessages} messages
                      </span>
                      <span className="text-xs text-gray-500">
                        {getChatSummary(selectedTicket)?.userMessages} from user
                      </span>
                      <span className="text-xs text-gray-500">
                        {getChatSummary(selectedTicket)?.aiMessages} from AI
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {["open", "in_progress", "resolved", "closed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedTicket.id, status)}
                      disabled={selectedTicket.status === status || isUpdating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${
                        selectedTicket.status === status
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        status.replace(/_/g, " ")
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
