/**
 * Tenant-facing payment client backed by Apartement_Service.
 * Named with V2 suffix because the legacy `paymentService.ts` calls some routes
 * that the backend hasn't built yet; new code should import from here.
 */

import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';
export type PaymentKind = 'bakong' | 'card' | 'bank' | 'cash' | 'wallet';

export interface Payment {
  id: number;
  customerId: number;
  methodKind: PaymentKind;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: string | null;
  receiptUrl: string | null;
  bakongQrString: string | null;
  externalRef: string | null;
  createdAt: string;
}

export interface PaymentMethod {
  id: number;
  customerId: number;
  kind: PaymentKind;
  label: string | null;
  masked: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface CreatePaymentRequest {
  invoiceId?: number;
  methodKind: PaymentKind;
  paymentMethodId?: number;
  amount: number;
  currency?: string;
}

export interface BakongQrRequest {
  amount: number;
  currency?: string;
  invoiceId?: number;
}

export interface BakongQrResponse {
  qrString: string;
  paymentId: number;
}

export const paymentServiceV2 = {
  async create(payload: CreatePaymentRequest): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<Payment>>(endpointsV2.payments.create, payload);
    return unwrap(res);
  },

  async byId(id: number | string): Promise<Payment> {
    const res = await apiClient.get<ApiResponse<Payment>>(endpointsV2.payments.byId(id));
    return unwrap(res);
  },

  async history(customerId: number): Promise<Payment[]> {
    const res = await apiClient.get<ApiResponse<Payment[]>>(
      `${endpointsV2.payments.history}?customerId=${customerId}`
    );
    return unwrap(res);
  },

  async listMethods(): Promise<PaymentMethod[]> {
    const res = await apiClient.get<ApiResponse<PaymentMethod[]>>(endpointsV2.payments.methods);
    return unwrap(res);
  },

  async addMethod(payload: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const res = await apiClient.post<ApiResponse<PaymentMethod>>(
      endpointsV2.payments.methods,
      payload
    );
    return unwrap(res);
  },

  async removeMethod(id: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(endpointsV2.payments.methodById(id));
    unwrap(res);
  },

  async requestBakongQr(payload: BakongQrRequest): Promise<BakongQrResponse> {
    const res = await apiClient.post<ApiResponse<BakongQrResponse>>(
      endpointsV2.payments.bakongQr,
      payload
    );
    return unwrap(res);
  },

  async confirm(id: number | string): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<Payment>>(endpointsV2.payments.confirm(id), {});
    return unwrap(res);
  },

  async cancel(id: number | string): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<Payment>>(endpointsV2.payments.cancel(id), {});
    return unwrap(res);
  },

  receiptUrl(id: number | string): string {
    return `${apiClient.getBaseURL()}${endpointsV2.payments.receipt(id)}`;
  },
};
