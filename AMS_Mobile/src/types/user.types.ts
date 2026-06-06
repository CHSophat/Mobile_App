export interface User {
  id: string;
  email: string;
  phone?: string;
  displayName: string;
  photoURL?: string;
  role: 'tenant' | 'owner' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  user: User;
  bio?: string;
  about?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'not_specified';
  nationality?: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  documentVerification?: DocumentVerification[];
  preferences?: UserPreferences;
}

export interface Address {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface DocumentVerification {
  type: 'national_id' | 'passport' | 'drivers_license' | 'other';
  documentNumber: string;
  issueDate: string;
  expiryDate?: string;
  issuingCountry: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
