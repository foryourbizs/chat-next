"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Character, ChatStatus } from "@/types/chat";
import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  character?: Character | null;
  status: ChatStatus;
}

export function TypingIndicator({ character, status }: TypingIndicatorProps) {
  const getMessage = () => {
    switch (status) {
      case "sending":
        return "메시지 전송 중...";
      case "receiving":
        return "응답 생성 중...";
      default:
        return "입력 중...";
    }
  };

  return (
    <div className="flex gap-3 p-4 animate-pulse">
      {/* 아바타 */}
      <Avatar className="h-8 w-8 shrink-0 bg-secondary text-secondary-foreground">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* 타이핑 내용 */}
      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">
            {character?.name || "AI 어시스턴트"}
          </span>
        </div>

        {/* 타이핑 애니메이션 */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-muted-foreground">{getMessage()}</span>
        </div>
      </div>
    </div>
  );
}
