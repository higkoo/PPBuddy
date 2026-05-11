export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  config: TenantConfig;
  createdAt: string;
}

export interface TenantConfig {
  maxUsers?: number;
  maxConversations?: number;
  allowedExpertModes?: string[];
}

export interface Conversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  expertModeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ExpertMode {
  id: string;
  tenantId: string;
  creatorId: string;
  name: string;
  description: string;
  systemPrompt: string;
  isPreset: boolean;
  icon?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string, tenantName?: string) => Promise<void>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
