import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export interface Notification {
  id: number;
  userId: number;
  kind: string;
  title: string;
  body: string | null;
  deeplink: string | null;
  payload: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPrefs {
  userId: number;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  paymentReminders: boolean;
  maintenanceUpdates: boolean;
  announcements: boolean;
  messages: boolean;
}

export interface RegisterDevicePayload {
  platform: 'ios' | 'android' | 'web';
  token: string;
  deviceId?: string;
  appVersion?: string;
}

export const notificationService = {
  async list(): Promise<Notification[]> {
    const res = await apiClient.get<ApiResponse<Notification[]>>(endpointsV2.notifications.list);
    return unwrap(res);
  },

  async unreadCount(): Promise<number> {
    const res = await apiClient.get<ApiResponse<{ count: number }>>(
      endpointsV2.notifications.unreadCount
    );
    return unwrap(res).count;
  },

  async markRead(id: number | string): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(endpointsV2.notifications.markRead(id), {});
    unwrap(res);
  },

  async markAllRead(): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(endpointsV2.notifications.markAllRead, {});
    unwrap(res);
  },

  // --- Push device registration (FCM/APNs) ---

  async registerDevice(payload: RegisterDevicePayload): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(
      endpointsV2.notifications.pushDevices,
      payload
    );
    unwrap(res);
  },

  async unregisterDevice(token: string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(
      endpointsV2.notifications.pushDeviceByToken(token)
    );
    unwrap(res);
  },

  // --- Per-user preferences ---

  async getPrefs(): Promise<NotificationPrefs> {
    const res = await apiClient.get<ApiResponse<NotificationPrefs>>(endpointsV2.notifications.prefs);
    return unwrap(res);
  },

  async updatePrefs(payload: Partial<NotificationPrefs>): Promise<NotificationPrefs> {
    const res = await apiClient.put<ApiResponse<NotificationPrefs>>(
      endpointsV2.notifications.prefs,
      payload
    );
    return unwrap(res);
  },
};
