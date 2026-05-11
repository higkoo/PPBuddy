import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { chatApi } from '../api/chat';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  createConversation: (title?: string, expertModeId?: string) => Promise<Conversation | null>;
  deleteConversation: (id: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  sendMessage: (message: string, expertModeId?: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  error: null,

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getConversations();
      if (response.success && response.data) {
        set({ conversations: response.data.conversations, isLoading: false });
      } else {
        set({ error: response.error || 'Failed to load conversations', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to load conversations', 
        isLoading: false 
      });
    }
  },

  loadMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.success && response.data) {
        set({ messages: response.data as Message[], isLoading: false });
      } else {
        set({ error: response.error || 'Failed to load messages', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to load messages', 
        isLoading: false 
      });
    }
  },

  createConversation: async (title?: string, expertModeId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.createConversation(title, expertModeId);
      if (response.success && response.data) {
        const conversation = response.data;
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversation: conversation,
          messages: [],
          isLoading: false,
        }));
        return conversation;
      } else {
        set({ error: response.error || 'Failed to create conversation', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to create conversation', 
        isLoading: false 
      });
      return null;
    }
  },

  deleteConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chatApi.deleteConversation(id);
      if (response.success) {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversation: state.currentConversation?.id === id ? null : state.currentConversation,
          messages: state.currentConversation?.id === id ? [] : state.messages,
          isLoading: false,
        }));
      } else {
        set({ error: response.error || 'Failed to delete conversation', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to delete conversation', 
        isLoading: false 
      });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
    if (conversation) {
      get().loadMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },

  sendMessage: async (message: string, expertModeId?: string) => {
    const { currentConversation } = get();
    const conversationId = currentConversation?.id;
    
    set({ isStreaming: true, streamingContent: '', error: null });
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    let fullContent = '';
    const assistantMessageId = `temp-assistant-${Date.now()}`;
    
    chatApi.streamMessage(
      { conversationId, message, expertModeId },
      (chunk) => {
        fullContent += chunk;
        set((state) => ({
          streamingContent: fullContent,
          messages: state.messages.some((m) => m.id === assistantMessageId)
            ? state.messages.map((m) =>
                m.id === assistantMessageId ? { ...m, content: fullContent } : m
              )
            : [
                ...state.messages,
                {
                  id: assistantMessageId,
                  conversationId: conversationId || '',
                  role: 'assistant' as const,
                  content: fullContent,
                  createdAt: new Date().toISOString(),
                },
              ],
        }));
      },
      (finalMessage) => {
        set((state) => ({
          isStreaming: false,
          streamingContent: '',
          messages: state.messages.map((m) =>
            m.id === assistantMessageId ? finalMessage : m
          ),
        }));
        if (!currentConversation) {
          get().loadConversations();
        }
      },
      (error) => {
        set({ 
          isStreaming: false, 
          streamingContent: '', 
          error: error.message || 'Failed to send message' 
        });
      }
    );
  },

  clearMessages: () => set({ messages: [], currentConversation: null }),
  clearError: () => set({ error: null }),
}));
