export interface Payment {
  id: string;
  leaseId?: string;
  unitId?: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  type: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  dueDate?: string;
  paidDate?: string;
  paymentMethod: 'bakong' | 'bank_transfer' | 'credit_card' | 'wallet';
  transactionId?: string;
  description?: string;
  receipt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'bakong' | 'bank_account' | 'credit_card' | 'wallet';
  isDefault: boolean;
  status: 'active' | 'inactive' | 'expired';
  details: BakongAccount | BankAccount | CreditCard | Wallet;
  createdAt: string;
  updatedAt: string;
}

export interface BakongAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  merchantId?: string;
  qrCode?: string;
}

export interface BankAccount {
  accountNumber: string;
  accountName: string;
  bankName: string;
  bankCode: string;
  swift?: string;
}

export interface CreditCard {
  cardNumber: string; // masked
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cardBrand: 'visa' | 'mastercard' | 'amex' | 'other';
}

export interface Wallet {
  balance: number;
  currency: string;
  lastTopup?: string;
}

export interface BakongQR {
  merchantId: string;
  amount: number;
  currency: string;
  transactionId: string;
  qrCodeData: string;
  qrCodeUrl?: string;
  deepLink?: string;
  expiresAt?: string;
}

export interface PaymentBreakdown {
  rentAmount: number;
  utilitiesAmount: number;
  depositsAmount: number;
  otherAmount: number;
  totalAmount: number;
  currency: string;
}

export interface PaymentHistory {
  payments: Payment[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface PaymentState {
  payments: Payment[];
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
  currentBakongQR: BakongQR | null;
}
