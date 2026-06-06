import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { communicationService } from '../api/communicationService';
import { PushNotificationPayload } from '@types/communication.types';

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
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
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
          const token = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          await SecureStore.setItemAsync('expoPushToken', token.data);
        } catch (tokenErr) {
          console.warn(
            '[notifications] Could not fetch Expo push token (non-fatal):',
            tokenErr
          );
        }
      }

      // Set up socket listener for notifications
      communicationService.on('new_notification', (notification) => {
        this.showNotification(notification);
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

  public async showNotification(data: any): Promise<void> {
    this.sendLocalNotification({
      title: data.title,
      body: data.body,
      data: data.data || {},
      deepLink: data.deepLink,
    });
  }

  public onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): () => void {
    return Notifications.addNotificationReceivedListener(callback);
  }

  public onNotificationResponse(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
