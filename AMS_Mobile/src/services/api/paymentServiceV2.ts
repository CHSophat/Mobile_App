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

/** Optional filters for the shared GET /payments list endpoint. */
export interface PaymentQuery {
  customerId?: number;
  status?: PaymentStatus;
  limit?: number;
  offset?: number;
}

/** A payment-to-invoice reconciliation record (GET /payments/unmatched, POST .../match). */
export interface PaymentMatch {
  matchId: number;
  paymentId: number;
  invoiceId: number;
  amount: number;
  matchedAt: string;
}

export interface MatchPaymentRequest {
  invoiceId: number;
  amount?: number;
}

const toQuery = (params: Record<string, string | number | undefined>): string => {
  const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return pairs.length ? `?${pairs.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}` : '';
};

export const paymentServiceV2 = {
  /** GET /payments — all payments, optionally filtered. */
  async list(query: PaymentQuery = {}): Promise<Payment[]> {
    const res = await apiClient.get<ApiResponse<Payment[]>>(
      `${endpointsV2.payments.list}${toQuery(query)}`
    );
    return unwrap(res);
  },

  async create(payload: CreatePaymentRequest): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<Payment>>(endpointsV2.payments.create, payload);
    return unwrap(res);
  },

  /** GET /payments/unmatched — payments not yet reconciled to an invoice. */
  async unmatched(): Promise<Payment[]> {
    const res = await apiClient.get<ApiResponse<Payment[]>>(endpointsV2.payments.unmatched);
    return unwrap(res);
  },

  /** POST /payments/{id}/match — reconcile a payment against an invoice. */
  async match(id: number | string, payload: MatchPaymentRequest): Promise<PaymentMatch> {
    const res = await apiClient.post<ApiResponse<PaymentMatch>>(
      endpointsV2.payments.match(id),
      payload
    );
    return unwrap(res);
  },

  /** DELETE /payments/matches/{matchId} — undo a reconciliation. */
  async deleteMatch(matchId: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(
      endpointsV2.payments.deleteMatch(matchId)
    );
    unwrap(res);
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
