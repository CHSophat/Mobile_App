import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { communicationService } from '../api/communicationService';
// Aliased to avoid collision with the global DOM `Notification` interface
import type {
  Notification as AppNotification,
  PushNotificationPayload,
} from '../../types/communication.types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private initialized = false;

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get notification permissions');
        return;
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        (Constants as any)?.easConfig?.projectId;

      if (projectId) {
        try {
          const token = await Notifications.getExpoPushTokenAsync({ projectId });
          await SecureStore.setItemAsync('expoPushToken', token.data);
        } catch (tokenErr) {
          // Firebase not configured in dev builds — push tokens won't work until
          // google-services.json / GoogleService-Info.plist are added.
          if (__DEV__) {
            console.log('[notifications] Push token skipped (Firebase not configured in dev)');
          } else {
            console.warn('[notifications] Could not fetch Expo push token:', tokenErr);
          }
        }
      }

      communicationService.on('new_notification', (n: AppNotification) => {
        this.showNotification(n);
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  public async sendLocalNotification(payload: PushNotificationPayload): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: payload.title,
        body: payload.body,
        badge: payload.badge,
        sound: payload.sound || 'default',
        data: payload.data,
      },
      trigger: null,
    });
  }

  public async showNotification(data: AppNotification): Promise<void> {
    this.sendLocalNotification({
      title: data.title,
      body: data.body,
      data: data.data
        ? Object.fromEntries(Object.entries(data.data).map(([k, v]) => [k, String(v)]))
        : {},
      deepLink: data.deepLink,
    });
  }

  public onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    const sub = Notifications.addNotificationReceivedListener(callback);
    return () => { sub.remove(); };
  }

  public onNotificationResponse(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const sub = Notifications.addNotificationResponseReceivedListener(callback);
    return () => { sub.remove(); };
  }
}

export const notificationService = new NotificationService();
