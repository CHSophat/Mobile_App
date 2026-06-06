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
    const res = await apiClient.post<ApiResponse<AddressDto>>(
      endpointsV2.customers.setPrimaryAddress(addressId),
      {}
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
