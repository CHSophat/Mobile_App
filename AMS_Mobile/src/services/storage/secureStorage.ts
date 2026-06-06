import * as SecureStore from 'expo-secure-store';

export class SecureStorageService {
  public async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  public async getItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  }

  public async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  public async setAuthToken(token: string): Promise<void> {
    await this.setItem('authToken', token);
  }

  public async getAuthToken(): Promise<string | null> {
    return await this.getItem('authToken');
  }

  public async setRefreshToken(token: string): Promise<void> {
    await this.setItem('refreshToken', token);
  }

  public async getRefreshToken(): Promise<string | null> {
    return await this.getItem('refreshToken');
  }

  public async clearAll(): Promise<void> {
    const keys = ['authToken', 'refreshToken', 'expoPushToken', 'userId'];
    for (const key of keys) {
      await this.removeItem(key);
    }
  }
}

export const secureStorageService = new SecureStorageService();
