export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  displayName?: string;
  photoURL?: string;
  /** Backend role names (e.g. "admin", "owner"); absent for plain tenants. */
  roles?: string[];
  emailVerified: boolean;
  phoneVerified?: boolean;
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phone?: string;
  role: 'tenant' | 'owner' | 'admin';
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface OTPVerification {
  phone: string;
  verificationId?: string;
  code?: string;
  isVerified: boolean;
}

export interface PasswordReset {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired?: boolean;
  token?: string;
}
