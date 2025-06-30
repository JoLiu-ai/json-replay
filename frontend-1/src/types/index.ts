// 对话相关类型定义
export interface Conversation {
  id: number;
  name: string;
  content: any;
  is_favorite: boolean;
  created_at?: string;
}

// API响应类型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// 对话统计信息
export interface ConversationStats {
  total: number;
  user: number;
  assistant: number;
}

// 组件Props类型
export interface ConversationManagerProps {
  onConversationSelect?: (conversation: Conversation) => void;
} 