"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStatus, useMessages, useSelectedCharacter } from "@/store/chat";
import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { TypingIndicator } from "./typing-indicator";

export function MessageList() {
  const messages = useMessages();
  const selectedCharacter = useSelectedCharacter();
  const chatStatus = useChatStatus();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  console.log("🎬 MessageList render:", {
    messagesCount: messages.length,
    messages,
    selectedCharacter: selectedCharacter?.name,
    chatStatus,
  });

  // 새 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 메시지가 없는 경우
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">
              {selectedCharacter
                ? `${selectedCharacter.name}와 대화를 시작해보세요`
                : "대화를 시작해보세요"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCharacter?.description ||
                "아래 입력창에 메시지를 입력하세요."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="min-h-full">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            character={selectedCharacter}
            isLast={index === messages.length - 1}
          />
        ))}

        {/* AI 응답 대기 중 타이핑 인디케이터 */}
        {(chatStatus === "receiving" || chatStatus === "sending") && (
          <TypingIndicator character={selectedCharacter} status={chatStatus} />
        )}

        {/* 자동 스크롤을 위한 앵커 */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
