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

export const invoiceService = {
  async byId(id: number | string): Promise<Invoice> {
    const res = await apiClient.get<ApiResponse<Invoice>>(endpointsV2.invoices.byId(id));
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
