import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'void';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  leaseId: number | null;
  propertyId: number | null;
  issueDate: string;
  dueDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  currency: string;
  status: InvoiceStatus;
  notes: string | null;
  pdfUrl: string | null;
  sentAt: string | null;
  voidedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceQuery {
  customerId?: number;
  leaseId?: number;
  propertyId?: number;
  status?: InvoiceStatus;
  limit?: number;
  offset?: number;
}

export interface CreateInvoiceRequest {
  customerId: number;
  leaseId?: number;
  propertyId?: number;
  issueDate: string;
  dueDate: string;
  periodStart?: string;
  periodEnd?: string;
  currency?: string;
  tax?: number;
  notes?: string;
  items: InvoiceLineItem[];
}

export type UpdateInvoiceRequest = Partial<
  Omit<CreateInvoiceRequest, 'customerId'>
>;

const toQuery = (params: Record<string, string | number | undefined>): string => {
  const pairs = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  return pairs.length
    ? `?${pairs.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}`
    : '';
};

export const invoiceService = {
  /** GET /invoices — list invoices, optionally filtered. */
  async list(query: InvoiceQuery = {}): Promise<Invoice[]> {
    const res = await apiClient.get<ApiResponse<Invoice[]>>(
      `${endpointsV2.invoices.list}${toQuery(query)}`
    );
    return unwrap(res);
  },

  async byId(id: number | string): Promise<Invoice> {
    const res = await apiClient.get<ApiResponse<Invoice>>(endpointsV2.invoices.byId(id));
    return unwrap(res);
  },

  /** POST /invoices — create a new invoice (admin/owner). */
  async create(payload: CreateInvoiceRequest): Promise<Invoice> {
    const res = await apiClient.post<ApiResponse<Invoice>>(
      endpointsV2.invoices.create,
      payload
    );
    return unwrap(res);
  },

  /** PUT /invoices/{id} — update a draft invoice. */
  async update(id: number | string, payload: UpdateInvoiceRequest): Promise<Invoice> {
    const res = await apiClient.put<ApiResponse<Invoice>>(
      endpointsV2.invoices.update(id),
      payload
    );
    return unwrap(res);
  },

  /** DELETE /invoices/{id}. */
  async remove(id: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(endpointsV2.invoices.delete(id));
    unwrap(res);
  },

  /** POST /invoices/{id}/send — email/issue the invoice to the customer. */
  async send(id: number | string): Promise<Invoice> {
    const res = await apiClient.post<ApiResponse<Invoice>>(endpointsV2.invoices.send(id), {});
    return unwrap(res);
  },

  /** POST /invoices/{id}/void — void an issued invoice. */
  async void(id: number | string): Promise<Invoice> {
    const res = await apiClient.post<ApiResponse<Invoice>>(endpointsV2.invoices.void(id), {});
    return unwrap(res);
  },

  /** Outstanding invoices for the current tenant. */
  async outstanding(customerId: number): Promise<Invoice[]> {
    const res = await apiClient.get<ApiResponse<Invoice[]>>(
      `${endpointsV2.invoices.outstanding}?customerId=${customerId}`
    );
    return unwrap(res);
  },

  /** Returns the absolute URL to the PDF. The app can open it in a viewer. */
  pdfUrl(id: number | string): string {
    return `${apiClient.getBaseURL()}${endpointsV2.invoices.pdf(id)}`;
  },
};
