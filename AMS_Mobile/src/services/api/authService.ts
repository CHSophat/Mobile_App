import { apiClient, tokenStorage } from './apiClient';
import { endpointsV2 } from './endpoints';

// --- Request shapes ----------------------------------------------------------

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// --- Response shapes (mirror Apartement_Service DTOs) ------------------------

export interface RegisterResponse {
  success: boolean;
  userId: number;
  email: string | null;
  message: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string | null;
  userId: number;
  email: string;
  phone: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  accessTokenExpires: string;
  is2FaRequired: boolean;
  isEmailVerified: boolean;
}

export interface UserProfile {
  userId: number;
  email: string;
  phone: string;
  roles: string[];
  isEmailVerified: boolean;
}

// --- Service -----------------------------------------------------------------

class AuthService {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>(endpointsV2.auth.register, payload);
  }

  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(endpointsV2.auth.login, payload);
    if (response.accessToken) {
      await tokenStorage.setAccessToken(response.accessToken);
    }
    if (response.refreshToken) {
      await tokenStorage.setRefreshToken(response.refreshToken);
    }
    return response;
  }

  async refresh(): Promise<AuthResponse> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token stored');
    }
    const response = await apiClient.post<AuthResponse>(endpointsV2.auth.refresh, {
      refreshToken,
    });
    if (response.accessToken) {
      await tokenStorage.setAccessToken(response.accessToken);
    }
    if (response.refreshToken) {
      await tokenStorage.setRefreshToken(response.refreshToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(endpointsV2.auth.logout, {});
    } catch {
      // Even if server-side revoke fails, clear local tokens.
    }
    await tokenStorage.clear();
  }

  async me(): Promise<UserProfile> {
    return apiClient.get<UserProfile>(endpointsV2.auth.me);
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(endpointsV2.auth.forgotPassword, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(endpointsV2.auth.resetPassword, { token, newPassword });
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getAccessToken();
    return !!token;
  }
}

export const authService = new AuthService();
export default authService;
