"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, Menu, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// 채팅 컴포넌트들
import { CharacterSelector } from "@/components/character/character-selector";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { ConversationList } from "@/components/conversation/conversation-list";

// 훅들
import {
  useChatInitialization,
  useCreateConversation,
  useDeleteConversation,
  useMessages,
  useSendMessage,
} from "@/hooks/use-chat-api";
import {
  useChatStore,
  useCurrentConversation,
  useSelectedCharacter,
  useMessages as useStoreMessages,
} from "@/store/chat";

export default function ChatPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 채팅 초기화 및 데이터 로딩
  const {
    isLoading: isInitializing,
    isError,
    refetch,
  } = useChatInitialization();

  // 현재 상태
  const currentConversation = useCurrentConversation();
  const selectedCharacter = useSelectedCharacter();
  const storeMessages = useStoreMessages();

  // 스토어 액션들
  const { setMessages, addOptimisticMessage } = useChatStore();

  // API 훅들
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateConversation();
  const deleteConversationMutation = useDeleteConversation();

  // 현재 대화의 메시지들 조회
  const {
    data: messages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessages(currentConversation?.id || 0, !!currentConversation);

  console.log("📋 Messages query state:", {
    conversationId: currentConversation?.id,
    queryMessages: messages,
    messagesLoading,
    messagesError,
    storeMessages: storeMessages,
  });

  // 메시지 데이터를 스토어에 동기화
  useEffect(() => {
    console.log("🔄 Messages sync effect:", {
      queryMessages: messages,
      currentConversation: currentConversation?.id,
      willSync: !!(messages && currentConversation),
    });

    if (messages && currentConversation) {
      console.log("✅ Syncing messages to store:", messages.length, "messages");
      setMessages(messages);
    }
  }, [messages, currentConversation, setMessages]);

  // 메시지 전송 처리
  const handleSendMessage = async (content: string) => {
    console.log("🚀 handleSendMessage called:", {
      content,
      currentConversation,
      selectedCharacter,
    });

    if (!currentConversation || !selectedCharacter) {
      toast.error("대화와 캐릭터를 선택해주세요");
      return;
    }

    const messageData = {
      content,
      conversationId: currentConversation.id,
    };

    console.log("📤 Sending message data:", messageData);

    // Optimistic update
    addOptimisticMessage(content);

    try {
      const result = await sendMessageMutation.mutateAsync(messageData);
      console.log("✅ Message sent successfully:", result);
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      toast.error("메시지 전송에 실패했습니다");
    }
  };

  // 새 대화 생성
  const handleCreateConversation = async () => {
    console.log("🚀 handleCreateConversation called:", { selectedCharacter });

    if (!selectedCharacter) {
      toast.error("먼저 캐릭터를 선택해주세요");
      return;
    }

    const conversationData = {
      title: `${selectedCharacter.name}와의 대화`,
      characterId: selectedCharacter.id,
      userId: 1, // 현재 하드코딩된 사용자 ID
    };

    console.log("📤 Creating conversation:", conversationData);

    try {
      const result = await createConversationMutation.mutateAsync(
        conversationData
      );
      console.log("✅ Conversation created successfully:", result);
      setIsMobileMenuOpen(false); // 모바일에서 메뉴 닫기
    } catch (error) {
      console.error("❌ Failed to create conversation:", error);
    }
  };

  // 대화 삭제
  const handleDeleteConversation = async (conversationId: number) => {
    try {
      await deleteConversationMutation.mutateAsync(conversationId);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  // 초기 로딩 중
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            채팅 시스템을 초기화하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // 오류 상태
  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold">초기화 실패</h2>
          <p className="text-muted-foreground">
            채팅 시스템을 불러올 수 없습니다.
          </p>
          <Button onClick={refetch}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* 좌측 사이드바 - 데스크톱 */}
      <div className="hidden md:flex md:w-80 border-r bg-muted/20">
        <div className="flex flex-col w-full">
          {/* 캐릭터 선택 섹션 */}
          <div className="p-4 border-b">
            <CharacterSelector />
          </div>

          {/* 대화 목록 섹션 */}
          <div className="flex-1">
            <ConversationList
              onCreateConversation={handleCreateConversation}
              onDeleteConversation={handleDeleteConversation}
              onEditConversation={() =>
                toast.info("대화 편집 기능은 준비 중입니다")
              }
            />
          </div>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 상단 헤더 */}
        <div className="border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 모바일 메뉴 버튼 */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* 캐릭터 선택 */}
                    <div className="p-4 border-b">
                      <CharacterSelector />
                    </div>

                    {/* 대화 목록 */}
                    <div className="flex-1">
                      <ConversationList
                        onCreateConversation={handleCreateConversation}
                        onDeleteConversation={handleDeleteConversation}
                        onEditConversation={() =>
                          toast.info("대화 편집 기능은 준비 중입니다")
                        }
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* 현재 대화 정보 */}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h1 className="font-semibold text-sm">
                    {currentConversation?.title || "AI 챗봇"}
                  </h1>
                  {selectedCharacter && (
                    <p className="text-xs text-muted-foreground">
                      {selectedCharacter.name}와 대화 중
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-hidden">
          {messagesLoading && currentConversation ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-muted-foreground">
                  메시지를 불러오는 중...
                </span>
              </div>
            </div>
          ) : (
            <MessageList />
          )}
        </div>

        {/* 메시지 입력 */}
        <MessageInput
          currentConversation={currentConversation}
          selectedCharacter={selectedCharacter}
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
        />
      </div>

      {/* 우측 패널 (선택적) - 현재는 숨김 */}
      {/* <div className="hidden xl:flex xl:w-64 border-l bg-muted/10">
        // 캐릭터 정보나 설정 등을 여기에 표시
      </div> */}
    </div>
  );
}
