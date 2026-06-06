/**
 * Customer-scoped client: profile, addresses, move-in checklist, leases.
 * Backed by Apartement_Service CQRS endpoints in
 * src/ApartmentManagementSystem.API/Endpoints/*.cs and
 * src/ApartmentManagementSystem.Application/{Command,Query}/CustomersCommand.
 */

import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export interface AddressDto {
  id: number;
  customerId: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isPrimary: boolean;
}

export interface CustomerProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  addresses: AddressDto[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface UpsertAddressRequest {
  label?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface ChecklistItemDto {
  id: number;
  area: string;
  itemName: string;
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  notes: string | null;
  photoUrls: string[];
}

export interface MoveChecklistDto {
  id: number;
  leaseId: number;
  signedAt: string | null;
  signatureUrl: string | null;
  items: ChecklistItemDto[];
  createdAt: string;
}

export interface CreateChecklistRequest {
  items: Omit<ChecklistItemDto, 'id' | 'photoUrls'>[];
  signatureBase64?: string;
  photoBase64s?: { area: string; photo: string }[];
}

export type LeaseStatus =
  | 'active'
  | 'upcoming'
  | 'expired'
  | 'terminated'
  | 'pending';

export interface LeaseHistoryDto {
  id: number;
  leaseNumber: string;
  unitLabel: string | null;
  propertyName: string | null;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  currency: string;
  status: LeaseStatus;
  requiresSignature: boolean;
}

export interface LeaseDocumentDto {
  id: number;
  leaseId: number;
  fileName: string;
  documentType: string | null;
  url: string;
  signed: boolean;
  uploadedAt: string;
}

export interface UploadLeaseDocumentRequest {
  fileName: string;
  documentType?: string;
  /** base64-encoded file contents */
  contentBase64: string;
}

export interface SignLeaseRequest {
  /** Typed full name of the signer (typed-signature agreement). */
  signedName: string;
  /** Optional base64-encoded signature image, when a signature pad is used. */
  signatureBase64?: string;
  agreedToTerms?: boolean;
}

export interface CustomerNoteDto {
  id: number;
  customerId: number;
  body: string;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CommunicationChannel = 'email' | 'sms' | 'call' | 'in_app' | 'note';
export type CommunicationDirection = 'inbound' | 'outbound';

export interface CommunicationDto {
  id: number;
  customerId: number;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject: string | null;
  body: string;
  occurredAt: string;
}

export interface TenantSummaryDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  unitLabel: string | null;
  propertyName: string | null;
  leaseStatus: LeaseStatus | null;
}

export interface CreateTenantRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  unitId?: number;
}

export interface OwnerPortfolioDto {
  ownerId: number;
  propertyCount: number;
  unitCount: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  currency: string;
  properties: {
    id: number;
    name: string;
    unitCount: number;
    occupiedUnits: number;
  }[];
}

export const customerService = {
  // ===== Profile =====
  async getProfile(customerId: number | string): Promise<CustomerProfileDto> {
    const res = await apiClient.get<ApiResponse<CustomerProfileDto>>(
      endpointsV2.customers.profile(customerId)
    );
    return unwrap(res);
  },

  async updateProfile(
    customerId: number | string,
    payload: UpdateProfileRequest
  ): Promise<CustomerProfileDto> {
    const res = await apiClient.put<ApiResponse<CustomerProfileDto>>(
      endpointsV2.customers.update(customerId),
      payload
    );
    return unwrap(res);
  },

  async uploadAvatar(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file as any);
    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      endpointsV2.uploads.profilePhoto,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap(res);
  },

  // ===== Addresses =====
  async listAddresses(customerId: number | string): Promise<AddressDto[]> {
    const res = await apiClient.get<ApiResponse<AddressDto[]>>(
      endpointsV2.customers.addresses(customerId)
    );
    return unwrap(res);
  },

  async addAddress(
    customerId: number | string,
    payload: UpsertAddressRequest
  ): Promise<AddressDto> {
    const res = await apiClient.post<ApiResponse<AddressDto>>(
      endpointsV2.customers.addresses(customerId),
      payload
    );
    return unwrap(res);
  },

  async updateAddress(
    addressId: number | string,
    payload: UpsertAddressRequest
  ): Promise<AddressDto> {
    const res = await apiClient.put<ApiResponse<AddressDto>>(
      endpointsV2.customers.addressById(addressId),
      payload
    );
    return unwrap(res);
  },

  async deleteAddress(addressId: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(
      endpointsV2.customers.addressById(addressId)
    );
    unwrap(res);
  },

  async setPrimaryAddress(addressId: number | string): Promise<AddressDto> {
    // API verb is PATCH /customers/addresses/{addressId}/set-primary
    const res = await apiClient.patch<ApiResponse<AddressDto>>(
      endpointsV2.customers.setPrimaryAddress(addressId),
      {}
    );
    return unwrap(res);
  },

  // ===== Tenants (onboarding / directory) =====
  async createTenant(payload: CreateTenantRequest): Promise<CustomerProfileDto> {
    const res = await apiClient.post<ApiResponse<CustomerProfileDto>>(
      endpointsV2.customers.createTenant,
      payload
    );
    return unwrap(res);
  },

  async searchCustomers(query: string): Promise<TenantSummaryDto[]> {
    const res = await apiClient.get<ApiResponse<TenantSummaryDto[]>>(
      `${endpointsV2.customers.search}?q=${encodeURIComponent(query)}`
    );
    return unwrap(res);
  },

  async listTenants(): Promise<TenantSummaryDto[]> {
    const res = await apiClient.get<ApiResponse<TenantSummaryDto[]>>(
      endpointsV2.customers.tenants
    );
    return unwrap(res);
  },

  async activeTenantsByProperty(
    propertyId: number | string
  ): Promise<TenantSummaryDto[]> {
    const res = await apiClient.get<ApiResponse<TenantSummaryDto[]>>(
      endpointsV2.customers.activeTenantsByProperty(propertyId)
    );
    return unwrap(res);
  },

  async ownerPortfolio(ownerId: number | string): Promise<OwnerPortfolioDto> {
    const res = await apiClient.get<ApiResponse<OwnerPortfolioDto>>(
      endpointsV2.customers.ownerPortfolio(ownerId)
    );
    return unwrap(res);
  },

  // ===== Leases (history, documents, signing) =====
  async getLeaseHistory(
    customerId: number | string
  ): Promise<LeaseHistoryDto[]> {
    const res = await apiClient.get<ApiResponse<LeaseHistoryDto[]>>(
      endpointsV2.customers.leaseHistory(customerId)
    );
    return unwrap(res);
  },

  async getLeaseDocuments(
    leaseId: number | string
  ): Promise<LeaseDocumentDto[]> {
    const res = await apiClient.get<ApiResponse<LeaseDocumentDto[]>>(
      endpointsV2.customers.leaseDocuments(leaseId)
    );
    return unwrap(res);
  },

  async uploadLeaseDocument(
    leaseId: number | string,
    payload: UploadLeaseDocumentRequest
  ): Promise<LeaseDocumentDto> {
    const res = await apiClient.post<ApiResponse<LeaseDocumentDto>>(
      endpointsV2.customers.leaseDocuments(leaseId),
      payload
    );
    return unwrap(res);
  },

  async signLease(
    leaseId: number | string,
    payload: SignLeaseRequest
  ): Promise<LeaseHistoryDto> {
    const res = await apiClient.post<ApiResponse<LeaseHistoryDto>>(
      endpointsV2.customers.signLease(leaseId),
      payload
    );
    return unwrap(res);
  },

  // ===== Notes =====
  async listNotes(customerId: number | string): Promise<CustomerNoteDto[]> {
    const res = await apiClient.get<ApiResponse<CustomerNoteDto[]>>(
      endpointsV2.customers.notes(customerId)
    );
    return unwrap(res);
  },

  async addNote(
    customerId: number | string,
    body: string
  ): Promise<CustomerNoteDto> {
    const res = await apiClient.post<ApiResponse<CustomerNoteDto>>(
      endpointsV2.customers.notes(customerId),
      { body }
    );
    return unwrap(res);
  },

  async updateNote(
    noteId: number | string,
    body: string
  ): Promise<CustomerNoteDto> {
    const res = await apiClient.put<ApiResponse<CustomerNoteDto>>(
      endpointsV2.customers.noteById(noteId),
      { body }
    );
    return unwrap(res);
  },

  async deleteNote(noteId: number | string): Promise<void> {
    const res = await apiClient.delete<ApiResponse<void>>(
      endpointsV2.customers.noteById(noteId)
    );
    unwrap(res);
  },

  // ===== Communications =====
  async listCommunications(
    customerId: number | string
  ): Promise<CommunicationDto[]> {
    const res = await apiClient.get<ApiResponse<CommunicationDto[]>>(
      endpointsV2.customers.communications(customerId)
    );
    return unwrap(res);
  },

  async logCommunication(
    customerId: number | string,
    payload: {
      channel: CommunicationChannel;
      direction: CommunicationDirection;
      body: string;
      subject?: string;
    }
  ): Promise<CommunicationDto> {
    const res = await apiClient.post<ApiResponse<CommunicationDto>>(
      endpointsV2.customers.communications(customerId),
      payload
    );
    return unwrap(res);
  },

  // ===== Move-in checklist =====
  async getMoveInChecklist(
    leaseId: number | string
  ): Promise<MoveChecklistDto> {
    const res = await apiClient.get<ApiResponse<MoveChecklistDto>>(
      endpointsV2.customers.moveInChecklist(leaseId)
    );
    return unwrap(res);
  },

  async createMoveInChecklist(
    leaseId: number | string,
    payload: CreateChecklistRequest
  ): Promise<MoveChecklistDto> {
    const res = await apiClient.post<ApiResponse<MoveChecklistDto>>(
      endpointsV2.customers.moveInChecklist(leaseId),
      payload
    );
    return unwrap(res);
  },

  async getChecklistById(
    checklistId: number | string
  ): Promise<MoveChecklistDto> {
    const res = await apiClient.get<ApiResponse<MoveChecklistDto>>(
      endpointsV2.customers.checklistById(checklistId)
    );
    return unwrap(res);
  },

  // ===== Password (re-exposed for security screens) =====
  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(
      '/auth/password/change',
      payload
    );
    unwrap(res);
  },
};
