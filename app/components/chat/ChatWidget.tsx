"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronDown, Paperclip, Send, MessageCircle, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { ChatMessage, AI_CAPABILITIES } from "@/lib/types/support";
import ChatMessages from "./ChatMessages";
import EscalationForm from "./EscalationForm";
import ConversationList from "./ConversationList";
import RatingModal from "./RatingModal";
import BookCallForm from "./BookCallForm";

interface ChatWidgetProps {
  userEmail?: string;
  userName?: string;
}

type ViewState = "chat" | "conversations" | "escalation" | "rating" | "booking";

export default function ChatWidget({ userEmail, userName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewState, setViewState] = useState<ViewState>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [unreadCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{name: string; type: string; preview?: string} | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        type: "ai",
        content: `Hi there! 👋 I'm DataProFlow Support AI agent. How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: "typing",
      type: "ai",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          conversationHistory: messages.filter((m) => m.id !== "welcome"),
        }),
      });

      const data = await response.json();

      // Remove typing indicator and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "typing");
        return [
          ...filtered,
          {
            id: data.message?.id || crypto.randomUUID(),
            type: "ai" as const,
            content: data.message?.content || "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          },
        ];
      });

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== "typing");
        return [
          ...filtered,
          {
            id: crypto.randomUUID(),
            type: "ai" as const,
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, conversationId, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTalkToHuman = () => {
    setViewState("escalation");
  };

  const handleEscalationComplete = () => {
    setViewState("chat");
    // Add system message
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "ai",
      content: "Thank you! Please give me a moment to connect you with our team. We'll contact you shortly at the email you provided.",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const handleBookCall = () => {
    setViewState("booking");
  };

  const handleBookingComplete = (booking: { id: string; date: string; time: string; meetLink?: string }) => {
    setViewState("chat");
    // Add system message about the booking
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "ai",
      content: `Great! Your call has been scheduled for ${new Date(booking.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${formatTime(booking.time)}. ${booking.meetLink ? `\n\nJoin link: ${booking.meetLink}` : ""}\n\nA calendar invite has been sent to your email.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  const handleRatingComplete = () => {
    setShowRating(false);
    // Reset chat
    setMessages([]);
    setConversationId(null);
    setViewState("conversations");
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setViewState("chat");
  };

  const handleSelectConversation = (id: string) => {
    setConversationId(id);
    setViewState("chat");
    // Load conversation messages
    loadConversationMessages(id);
  };

  const loadConversationMessages = async (id: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${id}`);
      const data = await response.json();
      if (data.messages) {
        const formattedMessages: ChatMessage[] = data.messages.map((msg: { id: string; sender_type: string; content: string; created_at: string }) => ({
          id: msg.id,
          type: msg.sender_type as "user" | "ai" | "agent" | "system",
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'image' : 'document';
    
    // Show uploading state
    setIsUploading(true);
    setUploadProgress({ name: file.name, type: fileType });

    // Create preview for images
    let preview: string | undefined;
    if (isImage) {
      preview = URL.createObjectURL(file);
      setUploadProgress({ name: file.name, type: fileType, preview });
    }

    // Simulate upload delay (replace with actual upload logic)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Create file message with appropriate icon
    const icon = isImage ? '🖼️' : '📄';
    const fileMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "user",
      content: `${icon} ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: new Date(),
      metadata: { fileName: file.name, fileSize: file.size, fileType, preview },
    };
    setMessages((prev) => [...prev, fileMessage]);

    // Reset states
    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary/90 transition-all duration-200 hover:scale-110 z-50 cursor-pointer"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      <div
        className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[380px] bg-white sm:rounded-2xl shadow-2xl border border-border overflow-hidden z-50 flex flex-col transition-all duration-300 ${
          isMinimized ? "h-[60px]" : "h-[100dvh] sm:h-[600px] sm:max-h-[80vh]"
        }`}
      >
        {/* Header */}
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">DataProFlow</h3>
              {viewState === "chat" && conversationId && (
                <p className="text-xs text-white/70">
                  Started {new Date().toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label={isMinimized ? "Expand" : "Minimize"}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isMinimized ? "rotate-180" : ""
                }`}
              />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {viewState === "chat" && (
                <>
                  {/* AI Capabilities Banner (shown only at start) */}
                  {messages.length <= 1 && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-border">
                      <p className="text-xs text-primary font-medium mb-2">
                        DataProFlow Support AI agent · AI
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        We can answer questions about:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {AI_CAPABILITIES.slice(0, 4).map((cap, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Messages */}
                  <ChatMessages
                    messages={messages}
                    onTalkToHuman={handleTalkToHuman}
                    onBookCall={handleBookCall}
                  />
                </>
              )}

              {viewState === "escalation" && (
                <EscalationForm
                  conversationId={conversationId}
                  defaultEmail={userEmail}
                  defaultName={userName}
                  onComplete={handleEscalationComplete}
                  onCancel={() => setViewState("chat")}
                />
              )}

              {viewState === "booking" && (
                <BookCallForm
                  defaultEmail={userEmail}
                  defaultName={userName}
                  conversationId={conversationId || undefined}
                  onComplete={handleBookingComplete}
                  onCancel={() => setViewState("chat")}
                />
              )}

              {viewState === "conversations" && (
                <ConversationList
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                />
              )}
            </div>

            {/* Input Area */}
            {viewState === "chat" && (
              <div className="p-3 border-t border-border bg-white shrink-0">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <button
                    onClick={handleFileSelect}
                    disabled={isUploading}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Attach file"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message"
                    className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-primary text-lg">💬</span>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || isUploading}
                      className="p-1 text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Send message"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden cursor-pointer"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                />
                
                {/* Upload Progress Indicator */}
                {isUploading && uploadProgress && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {uploadProgress.type === 'image' ? (
                        uploadProgress.preview ? (
                          <img src={uploadProgress.preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-primary" />
                        )
                      ) : (
                        <FileText className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{uploadProgress.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Rating Modal */}
      {showRating && (
        <RatingModal
          conversationId={conversationId}
          onComplete={handleRatingComplete}
          onSkip={handleRatingComplete}
        />
      )}
    </>
  );
}
