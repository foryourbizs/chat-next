// 채팅 관련 API 클라이언트
import { apiUtils } from "@/lib/api";
import type {
  Character,
  Conversation,
  ConversationWithLastMessage,
  CreateCharacterRequest,
  CreateConversationRequest,
  Message,
  PaginatedCharacters,
  PaginatedConversations,
  PaginatedMessages,
  SendMessageRequest,
  SendMessageResponse,
  UpdateCharacterRequest,
  UpdateConversationRequest,
} from "@/types/chat";

/**
 * 챗봇 AI 대화 API
 */
export const chatbotApi = {
  /**
   * AI에게 메시지 전송하고 응답 받기
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    return apiUtils.post<SendMessageResponse>("chatbot/send-message", data, {
      errorOptions: {
        showToast: true,
        title: "메시지 전송 실패",
        description: "AI와의 대화 중 오류가 발생했습니다.",
      },
    });
  },
};

/**
 * 캐릭터 관리 API
 */
export const charactersApi = {
  /**
   * 모든 캐릭터 조회
   */
  async getAll(): Promise<Character[]> {
    const response = await apiUtils.get<{ data: Character[] }>("characters", {
      errorOptions: {
        showToast: true,
        title: "캐릭터 조회 실패",
      },
    });
    return response.data;
  },

  /**
   * 페이지네이션된 캐릭터 목록 조회
   */
  async getMany(page = 1, limit = 20): Promise<PaginatedCharacters> {
    const query = apiUtils.buildCrudQuery({
      page: { number: page, size: limit },
    });
    return apiUtils.get<PaginatedCharacters>(`characters?${query}`);
  },

  /**
   * 특정 캐릭터 조회
   */
  async getById(id: number): Promise<Character> {
    return apiUtils.get<Character>(`characters/${id}`, {
      errorOptions: {
        showToast: true,
        title: "캐릭터 조회 실패",
      },
    });
  },

  /**
   * 새 캐릭터 생성
   */
  async create(data: CreateCharacterRequest): Promise<Character> {
    const response = await apiUtils.post<{ data: Character }>(
      "characters",
      data,
      {
        errorOptions: {
          showToast: true,
          title: "캐릭터 생성 실패",
          description: "캐릭터를 생성하는 중 오류가 발생했습니다.",
        },
      }
    );
    return response.data;
  },

  /**
   * 캐릭터 수정
   */
  async update(id: number, data: UpdateCharacterRequest): Promise<Character> {
    const response = await apiUtils.put<{ data: Character }>(
      `characters/${id}`,
      data,
      {
        errorOptions: {
          showToast: true,
          title: "캐릭터 수정 실패",
        },
      }
    );
    return response.data;
  },

  /**
   * 캐릭터 삭제
   */
  async delete(id: number): Promise<void> {
    return apiUtils.delete<void>(`characters/${id}`, {
      errorOptions: {
        showToast: true,
        title: "캐릭터 삭제 실패",
      },
    });
  },
};

/**
 * 대화 관리 API
 */
export const conversationsApi = {
  /**
   * 모든 대화 조회 (캐릭터 정보 포함)
   */
  async getAll(): Promise<Conversation[]> {
    const response = await apiUtils.get<{ data: Conversation[] }>(
      "conversations?include=character",
      {
        errorOptions: {
          showToast: true,
          title: "대화 목록 조회 실패",
        },
      }
    );
    return response.data;
  },

  /**
   * 페이지네이션된 대화 목록 조회 (마지막 메시지 포함)
   */
  async getMany(page = 1, limit = 20): Promise<PaginatedConversations> {
    const query = apiUtils.buildCrudQuery({
      page: { number: page, size: limit },
      join: ["character", "messages"],
    });
    return apiUtils.get<PaginatedConversations>(`conversations?${query}`);
  },

  /**
   * 특정 대화 조회
   */
  async getById(id: number): Promise<Conversation> {
    return apiUtils.get<Conversation>(`conversations/${id}`, {
      errorOptions: {
        showToast: true,
        title: "대화 조회 실패",
      },
    });
  },

  /**
   * 새 대화 시작
   */
  async create(data: CreateConversationRequest): Promise<Conversation> {
    const response = await apiUtils.post<{ data: Conversation }>(
      "conversations",
      data,
      {
        errorOptions: {
          showToast: true,
          title: "대화 생성 실패",
          description: "새 대화를 시작하는 중 오류가 발생했습니다.",
        },
      }
    );
    return response.data;
  },

  /**
   * 대화 제목 수정
   */
  async update(
    id: number,
    data: UpdateConversationRequest
  ): Promise<Conversation> {
    const response = await apiUtils.put<{ data: Conversation }>(
      `conversations/${id}`,
      data,
      {
        errorOptions: {
          showToast: true,
          title: "대화 수정 실패",
        },
      }
    );
    return response.data;
  },

  /**
   * 대화 삭제
   */
  async delete(id: number): Promise<void> {
    return apiUtils.delete<void>(`conversations/${id}`, {
      errorOptions: {
        showToast: true,
        title: "대화 삭제 실패",
      },
    });
  },
};

/**
 * 메시지 관리 API
 */
export const messagesApi = {
  /**
   * 특정 대화의 모든 메시지 조회
   */
  async getByConversation(conversationId: number): Promise<Message[]> {
    return apiUtils.get<Message[]>(`messages/conversation/${conversationId}`, {
      errorOptions: {
        showToast: true,
        title: "메시지 조회 실패",
      },
    });
  },

  /**
   * 특정 대화의 페이지네이션된 메시지 조회
   */
  async getManyByConversation(
    conversationId: number,
    page = 1,
    limit = 50
  ): Promise<PaginatedMessages> {
    const query = apiUtils.buildCrudQuery({
      page: { number: page, size: limit },
      filter: { conversationId_eq: conversationId },
      sort: [{ field: "createdAt", order: "ASC" }],
    });
    return apiUtils.get<PaginatedMessages>(`messages?${query}`);
  },

  /**
   * 특정 메시지 조회
   */
  async getById(id: number): Promise<Message> {
    return apiUtils.get<Message>(`messages/${id}`, {
      errorOptions: {
        showToast: true,
        title: "메시지 조회 실패",
      },
    });
  },
};

/**
 * 통합 채팅 API 유틸리티
 */
export const chatApiUtils = {
  /**
   * 대화 목록을 마지막 메시지와 함께 조회
   */
  async getConversationsWithLastMessage(): Promise<
    ConversationWithLastMessage[]
  > {
    const conversations = await conversationsApi.getAll();

    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const messages = await messagesApi.getByConversation(conversation.id);
          const lastMessage =
            messages.length > 0 ? messages[messages.length - 1] : undefined;

          return {
            ...conversation,
            lastMessage,
            messageCount: messages.length,
          } as ConversationWithLastMessage;
        } catch (error) {
          // 개별 대화의 메시지 조회 실패 시에도 대화는 포함
          return {
            ...conversation,
            messageCount: 0,
          } as ConversationWithLastMessage;
        }
      })
    );

    // 최신 메시지 순으로 정렬
    return conversationsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return (
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
      );
    });
  },
};
