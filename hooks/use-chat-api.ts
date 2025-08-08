// 채팅 관련 TanStack Query 훅들
import {
  charactersApi,
  chatApiUtils,
  chatbotApi,
  conversationsApi,
  messagesApi,
} from "@/lib/chat-api";
import { useChatStore } from "@/store/chat";
import type {
  CreateCharacterRequest,
  CreateConversationRequest,
  SendMessageRequest,
  UpdateCharacterRequest,
  UpdateConversationRequest,
} from "@/types/chat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

// 쿼리 키들
export const chatQueryKeys = {
  all: ["chat"] as const,
  characters: () => [...chatQueryKeys.all, "characters"] as const,
  character: (id: number) => [...chatQueryKeys.characters(), id] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  conversation: (id: number) => [...chatQueryKeys.conversations(), id] as const,
  messages: (conversationId: number) =>
    [...chatQueryKeys.all, "messages", conversationId] as const,
  conversationsWithLastMessage: () =>
    [...chatQueryKeys.conversations(), "withLastMessage"] as const,
};

/**
 * 캐릭터 관련 훅들
 */
export function useCharacters() {
  return useQuery({
    queryKey: chatQueryKeys.characters(),
    queryFn: charactersApi.getAll,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useCharacter(id: number, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.character(id),
    queryFn: () => charactersApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  const { addCharacter } = useChatStore();

  return useMutation({
    mutationFn: (data: CreateCharacterRequest) => charactersApi.create(data),
    onSuccess: (newCharacter) => {
      // 캐릭터 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.characters() });

      // 스토어에 새 캐릭터 추가
      addCharacter(newCharacter);

      toast.success("새 캐릭터가 생성되었습니다");
    },
    onError: (error) => {
      console.error("Failed to create character:", error);
      toast.error("캐릭터 생성에 실패했습니다");
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  const { updateCharacter } = useChatStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCharacterRequest }) =>
      charactersApi.update(id, data),
    onSuccess: (updatedCharacter) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.characters() });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.character(updatedCharacter.id),
      });

      // 스토어 업데이트
      updateCharacter(updatedCharacter.id, updatedCharacter);

      toast.success("캐릭터 정보가 수정되었습니다");
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  const { removeCharacter } = useChatStore();

  return useMutation({
    mutationFn: (id: number) => charactersApi.delete(id),
    onSuccess: (_, deletedId) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.characters() });
      queryClient.removeQueries({
        queryKey: chatQueryKeys.character(deletedId),
      });

      // 스토어에서 제거
      removeCharacter(deletedId);

      toast.success("캐릭터가 삭제되었습니다");
    },
  });
}

/**
 * 대화 관련 훅들
 */
export function useConversations() {
  return useQuery({
    queryKey: chatQueryKeys.conversations(),
    queryFn: conversationsApi.getAll,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

export function useConversationsWithLastMessage() {
  return useQuery({
    queryKey: chatQueryKeys.conversationsWithLastMessage(),
    queryFn: chatApiUtils.getConversationsWithLastMessage,
    staleTime: 1 * 60 * 1000, // 1분
  });
}

export function useConversation(id: number, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.conversation(id),
    queryFn: () => conversationsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { addConversation, setCurrentConversation } = useChatStore();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) =>
      conversationsApi.create(data),
    onSuccess: (newConversation) => {
      // 대화 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversationsWithLastMessage(),
      });

      // 스토어에 새 대화 추가하고 현재 대화로 설정
      const conversationWithLastMessage = {
        ...newConversation,
        messageCount: 0,
      };
      addConversation(conversationWithLastMessage);
      setCurrentConversation(newConversation);

      toast.success("새 대화가 시작되었습니다");
    },
    onError: (error) => {
      console.error("Failed to create conversation:", error);
      toast.error("대화 생성에 실패했습니다");
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  const { updateConversation } = useChatStore();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateConversationRequest;
    }) => conversationsApi.update(id, data),
    onSuccess: (updatedConversation) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversationsWithLastMessage(),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversation(updatedConversation.id),
      });

      // 스토어 업데이트
      updateConversation(updatedConversation.id, updatedConversation);

      toast.success("대화 제목이 수정되었습니다");
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  const { removeConversation } = useChatStore();

  return useMutation({
    mutationFn: (id: number) => conversationsApi.delete(id),
    onSuccess: (_, deletedId) => {
      // 관련 쿼리들 무효화 및 제거
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversations(),
      });
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversationsWithLastMessage(),
      });
      queryClient.removeQueries({
        queryKey: chatQueryKeys.conversation(deletedId),
      });
      queryClient.removeQueries({
        queryKey: chatQueryKeys.messages(deletedId),
      });

      // 스토어에서 제거
      removeConversation(deletedId);

      toast.success("대화가 삭제되었습니다");
    },
  });
}

/**
 * 메시지 관련 훅들
 */
export function useMessages(conversationId: number, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.messages(conversationId),
    queryFn: () => messagesApi.getByConversation(conversationId),
    enabled: enabled && !!conversationId,
    staleTime: 30 * 1000, // 30초
    refetchOnWindowFocus: false, // 채팅 중에는 포커스로 인한 리패치 방지
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addMessage, setChatStatus, setError, removeOptimisticMessage } =
    useChatStore();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => {
      setChatStatus("sending");
      return chatbotApi.sendMessage(data);
    },
    onSuccess: (response, variables) => {
      console.log("✅ useSendMessage onSuccess:", {
        response,
        variables,
      });

      // Optimistic update 제거
      console.log("🧹 Removing optimistic message");
      removeOptimisticMessage();

      // 응답받은 메시지들을 스토어에 추가
      console.log("📥 Adding messages to store:", {
        userMessage: response.userMessage,
        assistantMessage: response.assistantMessage,
      });
      addMessage(response.userMessage);
      addMessage(response.assistantMessage);

      // 메시지 쿼리 무효화
      console.log(
        "♻️ Invalidating queries for conversationId:",
        variables.conversationId
      );
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.conversationId),
      });

      // 대화 목록도 업데이트 (마지막 메시지가 바뀜)
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.conversationsWithLastMessage(),
      });

      console.log("✨ Message send success complete");
      setChatStatus("idle");
      setError(null);
    },
    onError: (error, variables) => {
      console.error("Failed to send message:", error);

      // Optimistic update 제거
      removeOptimisticMessage();

      setChatStatus("error");
      setError({
        message: "메시지 전송에 실패했습니다",
        timestamp: new Date().toISOString(),
      });
    },
  });
}

/**
 * 통합 채팅 초기화 훅
 * 컴포넌트 마운트 시 필요한 모든 데이터를 로드
 */
export function useChatInitialization() {
  const {
    setCharacters,
    setConversations,
    setCurrentConversation,
    setSelectedCharacter,
  } = useChatStore();

  // 캐릭터 목록 로드
  const charactersQuery = useCharacters();

  // 대화 목록 (마지막 메시지 포함) 로드
  const conversationsQuery = useConversationsWithLastMessage();

  // 데이터가 로드되면 스토어에 설정 (useEffect로 감싸서 렌더링 사이클 문제 해결)
  useEffect(() => {
    if (charactersQuery.data && charactersQuery.isSuccess) {
      setCharacters(charactersQuery.data);
    }
  }, [charactersQuery.data, charactersQuery.isSuccess, setCharacters]);

  useEffect(() => {
    if (conversationsQuery.data && conversationsQuery.isSuccess) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data, conversationsQuery.isSuccess, setConversations]);

  return {
    isLoading: charactersQuery.isLoading || conversationsQuery.isLoading,
    isError: charactersQuery.isError || conversationsQuery.isError,
    error: charactersQuery.error || conversationsQuery.error,
    refetch: () => {
      charactersQuery.refetch();
      conversationsQuery.refetch();
    },
  };
}
