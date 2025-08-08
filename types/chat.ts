// 채팅 관련 TypeScript 타입 정의
// 백엔드 엔티티와 일치하는 타입들

export interface Character {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  userId: number;
  characterId: number;
  character?: Character;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  conversationId: number;
  createdAt: string;
}

// API 요청/응답 타입들
export interface SendMessageRequest {
  content: string;
  conversationId: number;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

export interface CreateCharacterRequest {
  name: string;
  description: string;
  systemPrompt: string;
  userId: number;
  isActive: boolean;
  usageCount: number;
}

export interface UpdateCharacterRequest {
  name?: string;
  description?: string;
  systemPrompt?: string;
}

export interface CreateConversationRequest {
  title: string;
  characterId: number;
  userId: number; // 백엔드 필수 필드
}

export interface UpdateConversationRequest {
  title?: string;
}

// 채팅 UI 상태 관련 타입들
export interface ChatMessage extends Message {
  isLoading?: boolean;
  error?: string;
}

export interface ConversationWithLastMessage extends Conversation {
  lastMessage?: Message;
  messageCount?: number;
}

// 페이지네이션 관련 타입
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedConversations =
  PaginatedResponse<ConversationWithLastMessage>;
export type PaginatedMessages = PaginatedResponse<Message>;
export type PaginatedCharacters = PaginatedResponse<Character>;

// 채팅 상태 타입들
export type ChatStatus = "idle" | "sending" | "receiving" | "error";

export interface ChatError {
  message: string;
  code?: string;
  timestamp: string;
}
