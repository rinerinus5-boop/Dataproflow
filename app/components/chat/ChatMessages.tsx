"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "@/lib/types/support";

interface ChatMessagesProps {
  messages: ChatMessage[];
  onTalkToHuman: () => void;
  onBookCall?: () => void;
}

export default function ChatMessages({ messages, onTalkToHuman, onBookCall }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.type !== "user" && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse ml-0.5" />
            </div>
          )}
          <div
            className={`max-w-[80%] ${
              message.type === "user"
                ? "bg-primary text-white rounded-2xl rounded-br-md"
                : "bg-gray-100 text-foreground rounded-2xl rounded-bl-md"
            } px-4 py-2.5`}
          >
            {message.type !== "user" && (
              <p className="text-xs text-primary font-medium mb-1">
                DataProFlow Support AI agent
              </p>
            )}
            
            {message.isTyping ? (
              <div className="flex items-center gap-1 py-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${message.type === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatTime(message.timestamp)}
                </p>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Talk to Human & Book Call Buttons - show after AI messages */}
      {messages.length > 0 && 
        messages[messages.length - 1]?.type === "ai" && 
        !messages[messages.length - 1]?.isTyping &&
        (messages[messages.length - 1]?.content?.toLowerCase().includes("couldn't answer") ||
         messages[messages.length - 1]?.content?.toLowerCase().includes("human colleagues") ||
         messages.length > 4) && (
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={onTalkToHuman}
            className="px-4 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary/5 transition-colors cursor-pointer"
          >
            Talk to a human
          </button>
          {onBookCall && (
            <button
              onClick={onBookCall}
              className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Book a call
            </button>
          )}
        </div>
      )}

      {/* Was this helpful? */}
      {messages.length > 2 && 
        messages[messages.length - 1]?.type === "ai" && 
        !messages[messages.length - 1]?.isTyping && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary ml-0.5" />
          </div>
          <span>Was this helpful?</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
