import { apiClient } from './apiClient';
import { endpoints } from './endpoints';
import { Conversation, Message, Notification } from '@types/communication.types';
import { io, Socket } from 'socket.io-client';

export class CommunicationService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  public initializeSocket(): void {
    if (this.socket) return;

    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://socket.example.com';
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('socket_connected', null);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('socket_disconnected', null);
    });

    this.socket.on('new_message', (data: Message) => {
      this.emit('new_message', data);
    });

    this.socket.on('new_notification', (data: Notification) => {
      this.emit('new_notification', data);
    });
  }

  public disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>(
      endpoints.communication.conversations
    );
    return response.data || [];
  }

  public async getConversation(conversationId: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(
      endpoints.communication.conversationDetail(conversationId)
    );
    return response.data!;
  }

  public async getMessages(conversationId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      endpoints.communication.messages(conversationId)
    );
    return response.data || [];
  }

  public async sendMessage(
    conversationId: string,
    content: string,
    attachments?: string[]
  ): Promise<Message> {
    const response = await apiClient.post<Message>(
      endpoints.communication.sendMessage(conversationId),
      { content, attachments }
    );
    return response.data!;
  }

  public async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>(
      endpoints.communication.notifications
    );
    return response.data || [];
  }

  public async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.post<Notification>(
      endpoints.communication.readNotification(notificationId),
      {}
    );
    return response.data!;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const communicationService = new CommunicationService();
