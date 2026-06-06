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

export interface CreateConversationRequest {
  subject?: string;
  propertyId?: number;
  /** Other user ids to include in the conversation. */
  participantIds?: number[];
  /** Optional first message to post on creation. */
  message?: string;
}

export const conversationService = {
  async list(): Promise<Conversation[]> {
    const res = await apiClient.get<ApiResponse<Conversation[]>>(endpointsV2.conversations.list);
    return unwrap(res);
  },

  /** POST /conversations — start a new conversation. */
  async create(payload: CreateConversationRequest = {}): Promise<Conversation> {
    const res = await apiClient.post<ApiResponse<Conversation>>(
      endpointsV2.conversations.create,
      payload
    );
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

  /**
   * Builds the WebSocket URL for the realtime message stream (GET /ws/messages).
   * The `/ws` route lives at the server root, not under /api/v1, so we derive the
   * origin from the API base URL and swap http(s) → ws(s). Pass the access token
   * to authenticate the socket (many gateways accept it as a query param).
   */
  wsUrl(token?: string): string {
    const base = apiClient.getBaseURL();
    let origin = base;
    try {
      origin = new URL(base).origin;
    } catch {
      // Relative/invalid base — strip any /api/... path segment as a fallback.
      origin = base.replace(/\/api\/.*$/, '');
    }
    const wsOrigin = origin.replace(/^http/i, 'ws');
    const url = `${wsOrigin}${endpointsV2.conversations.ws}`;
    return token ? `${url}?access_token=${encodeURIComponent(token)}` : url;
  },
};
