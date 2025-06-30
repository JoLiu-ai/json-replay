// API配置
export const API_CONFIG = {
  // 基础URL - 可以根据环境变量或配置文件动态设置
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  
  // API端点
  ENDPOINTS: {
    CONVERSATIONS: '/api/conversations',
    UPLOAD: '/api/conversations/upload',
    VISUALIZER: '/visualizer',
  }
} as const;

// 构建完整的API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 预定义的API URL
export const API_URLS = {
  conversations: () => buildApiUrl(API_CONFIG.ENDPOINTS.CONVERSATIONS),
  upload: () => buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD),
  conversation: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.CONVERSATIONS}/${id}`),
  bookmark: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.CONVERSATIONS}/${id}/bookmark`),
  export: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.CONVERSATIONS}/${id}/export`),
  visualizer: (id: number) => buildApiUrl(`${API_CONFIG.ENDPOINTS.VISUALIZER}/${id}`),
} as const; 