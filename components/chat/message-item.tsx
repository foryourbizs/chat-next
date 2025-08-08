"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Character, ChatMessage } from "@/types/chat";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Bot, CheckCircle, Copy, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MessageItemProps {
  message: ChatMessage;
  character?: Character | null;
  isLast?: boolean;
}

export function MessageItem({
  message,
  character,
  isLast = false,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("메시지가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm", { locale: ko });
    } catch {
      return "";
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 p-4 hover:bg-muted/50 transition-colors",
        isLast && "pb-6"
      )}
    >
      {/* 아바타 */}
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0",
          isUser && "bg-primary text-primary-foreground",
          isAssistant && "bg-secondary text-secondary-foreground"
        )}
      >
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {/* 메시지 내용 */}
      <div className="flex-1 min-w-0">
        {/* 헤더 */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold">
            {isUser ? "나" : character?.name || "AI 어시스턴트"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          {message.isLoading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="animate-spin h-3 w-3 border border-current border-r-transparent rounded-full" />
              전송 중...
            </div>
          )}
          {message.error && (
            <span className="text-xs text-destructive">전송 실패</span>
          )}
        </div>

        {/* 메시지 본문 */}
        <div
          className={cn(
            "prose prose-sm max-w-none break-words",
            "prose-p:leading-relaxed prose-pre:bg-muted prose-pre:rounded-md prose-pre:p-3",
            "dark:prose-invert",
            message.isLoading && "opacity-70"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs"
            disabled={message.isLoading}
          >
            {copied ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Copy className="h-3 w-3 mr-1" />
            )}
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
      </div>
    </div>
  );
}
