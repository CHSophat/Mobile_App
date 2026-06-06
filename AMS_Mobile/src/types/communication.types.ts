export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  attachments?: MessageAttachment[];
  readBy: ReadReceipt[];
  type: 'text' | 'image' | 'file' | 'notification';
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface ReadReceipt {
  userId: string;
  readAt: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'ticket';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  subject?: string;
  description?: string;
  image?: string;
  isArchived: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  joinedAt: string;
  role?: 'admin' | 'member';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'maintenance' | 'payment' | 'lease' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  image?: string;
  isRead: boolean;
  deepLink?: string;
  createdAt: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  badge?: string;
  sound?: string;
  data?: Record<string, string>;
  image?: string;
  deepLink?: string;
}

export interface InAppNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onPress: () => void;
}

export interface CommunicationState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}
