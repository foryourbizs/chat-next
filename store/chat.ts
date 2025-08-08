// 채팅용 Zustand 스토어
import type {
  Character,
  ChatError,
  ChatMessage,
  ChatStatus,
  Conversation,
  ConversationWithLastMessage,
  Message,
} from "@/types/chat";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ChatState {
  // 현재 상태
  currentConversation: Conversation | null;
  selectedCharacter: Character | null;
  messages: ChatMessage[];
  conversations: ConversationWithLastMessage[];
  characters: Character[];

  // UI 상태
  chatStatus: ChatStatus;
  isLoading: boolean;
  error: ChatError | null;

  // 사이드바 상태
  isConversationsSidebarOpen: boolean;
  isCharacterPanelOpen: boolean;

  // Actions - 현재 대화 관리
  setCurrentConversation: (conversation: Conversation | null) => void;
  setSelectedCharacter: (character: Character | null) => void;

  // Actions - 메시지 관리
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<ChatMessage>) => void;
  addOptimisticMessage: (content: string) => void;
  removeOptimisticMessage: () => void;
  clearMessages: () => void;

  // Actions - 대화 목록 관리
  setConversations: (conversations: ConversationWithLastMessage[]) => void;
  addConversation: (conversation: ConversationWithLastMessage) => void;
  updateConversation: (
    conversationId: number,
    updates: Partial<Conversation>
  ) => void;
  removeConversation: (conversationId: number) => void;

  // Actions - 캐릭터 목록 관리
  setCharacters: (characters: Character[]) => void;
  addCharacter: (character: Character) => void;
  updateCharacter: (characterId: number, updates: Partial<Character>) => void;
  removeCharacter: (characterId: number) => void;

  // Actions - 상태 관리
  setChatStatus: (status: ChatStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: ChatError | null) => void;

  // Actions - UI 상태 관리
  toggleConversationsSidebar: () => void;
  toggleCharacterPanel: () => void;
  setConversationsSidebarOpen: (open: boolean) => void;
  setCharacterPanelOpen: (open: boolean) => void;

  // Actions - 유틸리티
  reset: () => void;
  resetCurrentChat: () => void;
}

const initialState = {
  // 현재 상태
  currentConversation: null,
  selectedCharacter: null,
  messages: [],
  conversations: [],
  characters: [],

  // UI 상태
  chatStatus: "idle" as ChatStatus,
  isLoading: false,
  error: null,

  // 사이드바 상태
  isConversationsSidebarOpen: true,
  isCharacterPanelOpen: false,
};

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Actions - 현재 대화 관리
      setCurrentConversation: (conversation) =>
        set({
          currentConversation: conversation,
          messages: [], // 새 대화 선택 시 메시지 초기화
        }),

      setSelectedCharacter: (character) =>
        set({ selectedCharacter: character }),

      // Actions - 메시지 관리
      setMessages: (messages) =>
        set({
          messages: messages.map((msg) => ({ ...msg, isLoading: false })),
        }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, isLoading: false }],
        })),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        })),

      addOptimisticMessage: (content) => {
        const optimisticMessage: ChatMessage = {
          id: Date.now(), // 임시 ID
          content,
          role: "user",
          conversationId: get().currentConversation?.id || 0,
          createdAt: new Date().toISOString(),
          isLoading: true,
        };

        set((state) => ({
          messages: [...state.messages, optimisticMessage],
          chatStatus: "sending",
        }));
      },

      removeOptimisticMessage: () =>
        set((state) => ({
          messages: state.messages.filter((msg) => !msg.isLoading),
          chatStatus: "idle",
        })),

      clearMessages: () => set({ messages: [] }),

      // Actions - 대화 목록 관리
      setConversations: (conversations) => set({ conversations }),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),

      updateConversation: (conversationId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, ...updates } : conv
          ),
          currentConversation:
            state.currentConversation?.id === conversationId
              ? { ...state.currentConversation, ...updates }
              : state.currentConversation,
        })),

      removeConversation: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.filter(
            (conv) => conv.id !== conversationId
          ),
          currentConversation:
            state.currentConversation?.id === conversationId
              ? null
              : state.currentConversation,
          messages:
            state.currentConversation?.id === conversationId
              ? []
              : state.messages,
        })),

      // Actions - 캐릭터 목록 관리
      setCharacters: (characters) => set({ characters }),

      addCharacter: (character) =>
        set((state) => ({
          characters: [character, ...state.characters],
        })),

      updateCharacter: (characterId, updates) =>
        set((state) => ({
          characters: state.characters.map((char) =>
            char.id === characterId ? { ...char, ...updates } : char
          ),
          selectedCharacter:
            state.selectedCharacter?.id === characterId
              ? { ...state.selectedCharacter, ...updates }
              : state.selectedCharacter,
        })),

      removeCharacter: (characterId) =>
        set((state) => ({
          characters: state.characters.filter(
            (char) => char.id !== characterId
          ),
          selectedCharacter:
            state.selectedCharacter?.id === characterId
              ? null
              : state.selectedCharacter,
        })),

      // Actions - 상태 관리
      setChatStatus: (status) => set({ chatStatus: status }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Actions - UI 상태 관리
      toggleConversationsSidebar: () =>
        set((state) => ({
          isConversationsSidebarOpen: !state.isConversationsSidebarOpen,
        })),

      toggleCharacterPanel: () =>
        set((state) => ({
          isCharacterPanelOpen: !state.isCharacterPanelOpen,
        })),

      setConversationsSidebarOpen: (open) =>
        set({
          isConversationsSidebarOpen: open,
        }),

      setCharacterPanelOpen: (open) =>
        set({
          isCharacterPanelOpen: open,
        }),

      // Actions - 유틸리티
      reset: () => set(initialState),

      resetCurrentChat: () =>
        set({
          currentConversation: null,
          selectedCharacter: null,
          messages: [],
          chatStatus: "idle",
          error: null,
        }),
    }),
    {
      name: "chat-store",
    }
  )
);

// 선택적 훅들 (편의성을 위해)
export const useCurrentConversation = () =>
  useChatStore((state) => state.currentConversation);
export const useSelectedCharacter = () =>
  useChatStore((state) => state.selectedCharacter);
export const useMessages = () => useChatStore((state) => state.messages);
export const useConversations = () =>
  useChatStore((state) => state.conversations);
export const useCharacters = () => useChatStore((state) => state.characters);
export const useChatStatus = () => useChatStore((state) => state.chatStatus);
export const useChatLoading = () => useChatStore((state) => state.isLoading);
export const useChatError = () => useChatStore((state) => state.error);
