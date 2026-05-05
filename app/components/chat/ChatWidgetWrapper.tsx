"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("./ChatWidget"), {
  ssr: false,
});

interface ChatWidgetWrapperProps {
  userEmail?: string;
  userName?: string;
}

export default function ChatWidgetWrapper({ userEmail, userName }: ChatWidgetWrapperProps) {
  return <ChatWidget userEmail={userEmail} userName={userName} />;
}
