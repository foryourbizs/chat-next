"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useCharacters,
  useChatStore,
  useConversations,
  useCurrentConversation,
} from "@/store/chat";
import type { ConversationWithLastMessage } from "@/types/chat";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { MessageCircle, Plus } from "lucide-react";

interface ConversationListProps {
  onCreateConversation?: () => void;
  className?: string;
}

export function ConversationList({
  onCreateConversation,
  className,
}: ConversationListProps) {
  const conversations = useConversations();
  const currentConversation = useCurrentConversation();
  const characters = useCharacters();
  const { setCurrentConversation, setSelectedCharacter } = useChatStore();

  // 대화 선택 (연결된 캐릭터도 함께 선택)
  const handleSelectConversation = (
    conversation: ConversationWithLastMessage
  ) => {
    console.log("🚀 Selecting conversation:", conversation);

    // 대화 설정
    setCurrentConversation(conversation);

    // 해당 대화의 캐릭터 찾아서 선택
    const relatedCharacter = characters.find(
      (character) => character.id === conversation.characterId
    );

    if (relatedCharacter) {
      console.log("✅ Auto-selecting character:", relatedCharacter.name);
      setSelectedCharacter(relatedCharacter);
    } else {
      console.warn("⚠️ Character not found for conversation:", {
        conversationId: conversation.id,
        characterId: conversation.characterId,
      });
    }
  };

  // TODO: 대화 삭제 기능 (미구현)
  // const handleDelete = async (conversationId: number, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (deletingId) return;
  //   setDeletingId(conversationId);
  //   try {
  //     await onDeleteConversation?.(conversationId);
  //     toast.success("대화가 삭제되었습니다");
  //   } catch {
  //     toast.error("대화 삭제에 실패했습니다");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // };

  // TODO: 대화 편집 기능 (미구현)
  // const handleEdit = (
  //   conversation: ConversationWithLastMessage,
  //   e: React.MouseEvent
  // ) => {
  //   e.stopPropagation();
  //   onEditConversation?.(conversation);
  // };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, "HH:mm", { locale: ko });
      } else if (diffInHours < 24 * 7) {
        return format(date, "MM/dd", { locale: ko });
      } else {
        return format(date, "yyyy/MM/dd", { locale: ko });
      }
    } catch {
      return "";
    }
  };

  // 마지막 메시지 미리보기
  const getLastMessagePreview = (conversation: ConversationWithLastMessage) => {
    if (!conversation.lastMessage) {
      return "새 대화";
    }

    const content = conversation.lastMessage.content;
    const isUser = conversation.lastMessage.role === "user";
    const prefix = isUser
      ? "나: "
      : `${conversation.character?.name || "AI"}: `;

    return `${prefix}${
      content.length > 50 ? content.slice(0, 50) + "..." : content
    }`;
  };

  // 대화가 없는 경우
  if (conversations.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="space-y-4">
          {onCreateConversation && (
            <Button onClick={onCreateConversation} className="w-full">
              <Plus className="h-4 w-4 mr-2" />새 대화 시작
            </Button>
          )}

          <div className="text-center space-y-2 py-8">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <MessageCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium text-sm">대화가 없습니다</h3>
              <p className="text-xs text-muted-foreground">
                새 대화를 시작해보세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* 헤더 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">대화 목록</h2>
          <Badge variant="secondary" className="text-xs">
            {conversations.length}
          </Badge>
        </div>

        {onCreateConversation && (
          <Button onClick={onCreateConversation} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />새 대화 시작
          </Button>
        )}
      </div>

      {/* 대화 목록 */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group relative p-3 rounded-lg cursor-pointer transition-colors",
                "hover:bg-muted/50",
                currentConversation?.id === conversation.id && "bg-muted"
              )}
              onClick={() => handleSelectConversation(conversation)}
            >
              {/* 대화 내용 */}
              <div className="flex items-start gap-3">
                {/* 대화 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.character?.name}
                      </h4>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDate(
                        conversation.lastMessage?.createdAt ||
                          conversation.updatedAt
                      )}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {getLastMessagePreview(conversation)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
