/**
 * Lease management client backed by the "Leases (Shared)" controller in
 * Apartement_Service. Covers status changes, the signature lifecycle,
 * renewals/terminations and lease documents.
 *
 * Note: tenant-scoped lease *history* lives on `customerService`
 * (GET /customers/{id}/leases/history). This service is keyed by leaseId and
 * is used by the lease detail / management flows.
 */

import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';
import type {
  LeaseStatus,
  LeaseDocumentDto,
  UploadLeaseDocumentRequest,
  SignLeaseRequest,
} from './customerService';

export type { LeaseStatus, LeaseDocumentDto } from './customerService';

export interface Lease {
  id: number;
  leaseNumber: string;
  customerId: number;
  unitId: number | null;
  propertyId: number | null;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  currency: string;
  status: LeaseStatus;
  signedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RenewLeaseRequest {
  endDate: string;
  monthlyRent?: number;
}

export interface TerminateLeaseRequest {
  effectiveDate: string;
  reason?: string;
}

export const leaseService = {
  async byId(id: number | string): Promise<Lease> {
    const res = await apiClient.get<ApiResponse<Lease>>(endpointsV2.leases.byId(id));
    return unwrap(res);
  },

  /** PATCH /leases/{id}/status — change the lease lifecycle status. */
  async updateStatus(id: number | string, status: LeaseStatus): Promise<Lease> {
    const res = await apiClient.patch<ApiResponse<Lease>>(
      endpointsV2.leases.status(id),
      { status }
    );
    return unwrap(res);
  },

  /** POST /leases/{id}/send-for-signature — dispatch the lease for the tenant to sign. */
  async sendForSignature(id: number | string): Promise<Lease> {
    const res = await apiClient.post<ApiResponse<Lease>>(
      endpointsV2.leases.sendForSignature(id),
      {}
    );
    return unwrap(res);
  },

  /** POST /leases/{id}/sign — record the tenant's signature. */
  async sign(id: number | string, payload: SignLeaseRequest): Promise<Lease> {
    const res = await apiClient.post<ApiResponse<Lease>>(
      endpointsV2.leases.sign(id),
      payload
    );
    return unwrap(res);
  },

  /** POST /leases/{id}/renew — extend the lease term. */
  async renew(id: number | string, payload: RenewLeaseRequest): Promise<Lease> {
    const res = await apiClient.post<ApiResponse<Lease>>(
      endpointsV2.leases.renew(id),
      payload
    );
    return unwrap(res);
  },

  /** POST /leases/{id}/terminate — end the lease early. */
  async terminate(
    id: number | string,
    payload: TerminateLeaseRequest
  ): Promise<Lease> {
    const res = await apiClient.post<ApiResponse<Lease>>(
      endpointsV2.leases.terminate(id),
      payload
    );
    return unwrap(res);
  },

  /** GET /leases/{id}/documents. */
  async getDocuments(id: number | string): Promise<LeaseDocumentDto[]> {
    const res = await apiClient.get<ApiResponse<LeaseDocumentDto[]>>(
      endpointsV2.leases.documents(id)
    );
    return unwrap(res);
  },

  /** POST /leases/{id}/documents — attach a document to the lease. */
  async addDocument(
    id: number | string,
    payload: UploadLeaseDocumentRequest
  ): Promise<LeaseDocumentDto> {
    const res = await apiClient.post<ApiResponse<LeaseDocumentDto>>(
      endpointsV2.leases.documents(id),
      payload
    );
    return unwrap(res);
  },
};
