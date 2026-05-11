import apiClient from './client';
import { Conversation, Message, ApiResponse } from '../types';

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface SendMessageRequest {
  conversationId?: string;
  expertModeId?: string;
  message: string;
}

export interface SendMessageResponse {
  conversation: Conversation;
  message: Message;
}

export const chatApi = {
  getConversations: async (): Promise<ApiResponse<ConversationsResponse>> => {
    const response = await apiClient.get('/api/conversations');
    return response.data;
  },

  getConversation: async (id: string): Promise<ApiResponse<Conversation>> => {
    const response = await apiClient.get(`/api/conversations/${id}`);
    return response.data;
  },

  getMessages: async (conversationId: string): Promise<ApiResponse<Message[]>> => {
    const response = await apiClient.get(`/api/conversations/${conversationId}/messages`);
    return response.data;
  },

  createConversation: async (title?: string, expertModeId?: string): Promise<ApiResponse<Conversation>> => {
    const response = await apiClient.post('/api/conversations', { title, expertModeId });
    return response.data;
  },

  deleteConversation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/conversations/${id}`);
    return response.data;
  },

  sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<SendMessageResponse>> => {
    const response = await apiClient.post('/api/chat', data);
    return response.data;
  },

  streamMessage: (
    data: SendMessageRequest,
    onChunk: (content: string) => void,
    onComplete: (message: Message) => void,
    onError: (error: Error) => void
  ) => {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (data.conversationId) params.append('conversationId', data.conversationId);
    if (data.expertModeId) params.append('expertModeId', data.expertModeId);
    params.append('message', data.message);

    const conversationId = data.conversationId || '';

    fetch(`/api/chat/stream?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Stream request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                onComplete({
                  id: '',
                  conversationId,
                  role: 'assistant',
                  content: fullContent,
                  createdAt: new Date().toISOString(),
                });
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContent += parsed.content;
                  onChunk(parsed.content);
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      })
      .catch(onError);
  },
};
