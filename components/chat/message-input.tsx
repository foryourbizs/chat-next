"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/store/chat";
import type { Character, Conversation } from "@/types/chat";
import { Loader2, Send, StopCircle } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface MessageInputProps {
  currentConversation: Conversation | null;
  selectedCharacter: Character | null;
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({
  currentConversation,
  selectedCharacter,
  onSendMessage,
  disabled = false,
}: MessageInputProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { chatStatus, setChatStatus } = useChatStore();
  const isSending = chatStatus === "sending" || chatStatus === "receiving";

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // 자동 높이 조절
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 메시지 전송
  const handleSend = useCallback(async () => {
    if (!input.trim() || isSending || disabled) {
      return;
    }

    if (!selectedCharacter) {
      toast.error("캐릭터를 선택해주세요");
      return;
    }

    if (!currentConversation) {
      toast.error("대화를 시작해주세요");
      return;
    }

    const messageContent = input.trim();
    setInput("");

    // 텍스트영역 높이 리셋
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage(messageContent);
    } catch (error) {
      // 에러 시 입력값 복원
      setInput(messageContent);
      console.error("Failed to send message:", error);
    }
  }, [
    input,
    isSending,
    disabled,
    selectedCharacter,
    currentConversation,
    onSendMessage,
  ]);

  // Enter 키 처리 (Shift+Enter는 줄바꿈, Enter는 전송)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // 전송 중단
  const handleStop = () => {
    setChatStatus("idle");
    toast.info("메시지 전송이 중단되었습니다");
  };

  const placeholder = selectedCharacter
    ? `${selectedCharacter.name}에게 메시지를 입력하세요...`
    : "캐릭터를 선택하고 메시지를 입력하세요...";

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-3 items-end">
        {/* 텍스트 입력 영역 */}
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            disabled={disabled || !selectedCharacter || !currentConversation}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
        </div>

        {/* 전송/중단 버튼 */}
        <div className="flex gap-2">
          {isSending ? (
            <Button
              variant="outline"
              size="icon"
              onClick={handleStop}
              className="shrink-0"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={
                !input.trim() ||
                disabled ||
                !selectedCharacter ||
                !currentConversation
              }
              size="icon"
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 도움말 텍스트 */}
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>
          {!selectedCharacter
            ? "캐릭터를 선택해주세요"
            : !currentConversation
            ? "대화를 시작해주세요"
            : "Enter: 전송, Shift+Enter: 줄바꿈"}
        </span>
        <span>{input.length} / 1000</span>
      </div>
    </div>
  );
}
