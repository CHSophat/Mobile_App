import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export interface Conversation {
  id: number;
  subject: string | null;
  propertyId: number | null;
  createdBy: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MessageKind = 'text' | 'image' | 'file' | 'system';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderUserId: number;
  kind: MessageKind;
  body: string | null;
  attachmentUrl: string | null;
  sentAt: string;
}

export const conversationService = {
  async list(): Promise<Conversation[]> {
    const res = await apiClient.get<ApiResponse<Conversation[]>>(endpointsV2.conversations.list);
    return unwrap(res);
  },

  async byId(id: number | string): Promise<Conversation> {
    const res = await apiClient.get<ApiResponse<Conversation>>(endpointsV2.conversations.byId(id));
    return unwrap(res);
  },

  /** Paginated by cursor: pass the oldest sentAt you've already loaded as `before`. */
  async messages(id: number | string, before?: string, limit = 50): Promise<ChatMessage[]> {
    const q = new URLSearchParams();
    if (before) q.set('before', before);
    q.set('limit', String(limit));
    const url = `${endpointsV2.conversations.messages(id)}?${q.toString()}`;
    const res = await apiClient.get<ApiResponse<ChatMessage[]>>(url);
    return unwrap(res);
  },

  async send(id: number | string, body: string, kind: MessageKind = 'text', attachmentUrl?: string): Promise<ChatMessage> {
    const res = await apiClient.post<ApiResponse<ChatMessage>>(
      endpointsV2.conversations.messages(id),
      { body, kind, attachmentUrl }
    );
    return unwrap(res);
  },

  async markRead(id: number | string): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(endpointsV2.conversations.read(id), {});
    unwrap(res);
  },
};
