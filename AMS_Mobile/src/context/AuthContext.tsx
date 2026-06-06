import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  authService,
  type AuthResponse,
  type RegisterRequest,
  type LoginRequest,
  type UserProfile,
} from '../services/api/authService';
import { tokenStorage } from '../services/api/apiClient';

interface AuthState {
  status: 'loading' | 'authenticated' | 'guest';
  user: UserProfile | null;
}

interface AuthContextValue extends AuthState {
  login(payload: LoginRequest): Promise<AuthResponse>;
  register(payload: RegisterRequest): Promise<void>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  const bootstrap = useCallback(async () => {
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      setState({ status: 'guest', user: null });
      return;
    }
    try {
      const user = await authService.me();
      setState({ status: 'authenticated', user });
    } catch {
      // Token invalid/expired — fall back to guest.
      await tokenStorage.clear();
      setState({ status: 'guest', user: null });
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);
    setState({
      status: 'authenticated',
      user: {
        userId: response.userId,
        email: response.email,
        phone: response.phone,
        roles: response.roles,
        isEmailVerified: response.isEmailVerified,
      },
    });
    return response;
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await authService.register(payload);
    // Backend doesn't auto-log-in on register; caller flow should redirect to login.
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ status: 'guest', user: null });
  }, []);

  const refresh = useCallback(async () => {
    await authService.refresh();
    await bootstrap();
  }, [bootstrap]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, refresh }),
    [state, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
