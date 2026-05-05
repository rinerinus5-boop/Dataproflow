"use client";

import { useState, useEffect } from "react";
import { Plus, MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  status: string;
  started_at: string;
  last_message_at: string;
  support_messages: {
    id: string;
    content: string;
    sender_type: string;
    created_at: string;
  }[];
}

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat");
      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getLastMessage = (conversation: Conversation) => {
    const messages = conversation.support_messages || [];
    if (messages.length === 0) return "No messages yet";
    const lastMsg = messages[messages.length - 1];
    const prefix = lastMsg.sender_type === "ai" ? "DataProFlow: " : "";
    const content = lastMsg.content.substring(0, 50);
    return prefix + content + (lastMsg.content.length > 50 ? "..." : "");
  };

  const getUnreadCount = (conversation: Conversation) => {
    // For now, return 0 - can be enhanced later
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Conversations */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">No conversations yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            Start a new conversation to get help
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Started {new Date(conversation.started_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} at {new Date(conversation.started_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.last_message_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {getLastMessage(conversation)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        conversation.status === "ended" || conversation.status === "resolved"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {conversation.status === "ended" || conversation.status === "resolved"
                        ? "Ended"
                        : "Active"}
                    </span>
                    {getUnreadCount(conversation) > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {getUnreadCount(conversation)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Conversation Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onNewConversation}
          className="w-full py-3 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New conversation
        </button>
      </div>
    </div>
  );
}
