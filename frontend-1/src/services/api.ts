import { API_URLS } from '../config/api';
import type { Conversation, ApiResponse } from '../types';

class ApiService {
  private async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // 获取所有对话
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.request<Conversation[]>(API_URLS.conversations());
  }

  // 上传对话文件
  async uploadConversation(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(API_URLS.upload(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || `Upload failed: ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // 切换书签状态
  async toggleBookmark(conversationId: number): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(API_URLS.bookmark(conversationId), {
      method: 'POST',
    });
  }

  // 删除对话
  async deleteConversation(conversationId: number): Promise<ApiResponse<any>> {
    return this.request<any>(API_URLS.conversation(conversationId), {
      method: 'DELETE',
    });
  }

  // 导出对话
  async exportConversation(conversationId: number): Promise<ApiResponse<any>> {
    return this.request<any>(API_URLS.export(conversationId));
  }

  // 获取可视化器URL
  getVisualizerUrl(conversationId: number): string {
    return API_URLS.visualizer(conversationId);
  }
}

// 导出单例实例
export const apiService = new ApiService(); 