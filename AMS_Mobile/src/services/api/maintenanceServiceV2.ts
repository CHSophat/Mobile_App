/**
 * Tenant-facing maintenance client backed by Apartement_Service catalog routes
 * (/maintenance/requests/*). V2 suffix avoids colliding with legacy
 * `maintenanceService.ts`.
 */

import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';
import type { PageResult } from '@hooks/usePaginatedList';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'emergency';
export type MaintenanceStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export interface MaintenanceRequest {
  id: number;
  productId: number;
  customerId: number;
  category: string | null;
  title: string | null;
  priority: MaintenancePriority;
  description: string;
  photoUrls: string[] | null;
  status: MaintenanceStatus;
  assignedTo: number | null;
  responseNote: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceRequest {
  productId: number;
  category?: string;
  title?: string;
  priority: MaintenancePriority;
  description: string;
  photoUrls?: string[];
}

export interface ListMaintenanceParams {
  page?: number;
  pageSize?: number;
  status?: MaintenanceStatus | 'all';
  customerId?: number;
}

export interface Vendor {
  id: number;
  name: string;
  trade: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateVendorRequest {
  name: string;
  trade?: string;
  phone?: string;
  email?: string;
}

export interface SlaSummary {
  open: number;
  inProgress: number;
  overdue: number;
  completedThisMonth: number;
  avgResolutionHours: number;
}

export const maintenanceServiceV2 = {
  async list(
    params: ListMaintenanceParams = {}
  ): Promise<PageResult<MaintenanceRequest>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.customerId) q.set('customerId', String(params.customerId));
    const qs = q.toString();
    const res = await apiClient.get<ApiResponse<PageResult<MaintenanceRequest>>>(
      `${endpointsV2.maintenance.requests}${qs ? `?${qs}` : ''}`
    );
    return unwrap(res);
  },

  async create(payload: CreateMaintenanceRequest): Promise<MaintenanceRequest> {
    const res = await apiClient.post<ApiResponse<MaintenanceRequest>>(
      endpointsV2.maintenance.requests,
      payload
    );
    return unwrap(res);
  },

  async byId(id: number | string): Promise<MaintenanceRequest> {
    const res = await apiClient.get<ApiResponse<MaintenanceRequest>>(
      endpointsV2.maintenance.requestById(id)
    );
    return unwrap(res);
  },

  /** PATCH /maintenance/requests/{id}/status — move a request through its lifecycle. */
  async updateStatus(
    id: number | string,
    status: MaintenanceStatus,
    responseNote?: string
  ): Promise<MaintenanceRequest> {
    const res = await apiClient.patch<ApiResponse<MaintenanceRequest>>(
      endpointsV2.maintenance.requestStatus(id),
      { status, responseNote }
    );
    return unwrap(res);
  },

  /** PATCH /maintenance/requests/{id}/assign — assign to a staff member or vendor. */
  async assign(
    id: number | string,
    assignee: { assignedTo?: number; vendorId?: number }
  ): Promise<MaintenanceRequest> {
    const res = await apiClient.patch<ApiResponse<MaintenanceRequest>>(
      endpointsV2.maintenance.requestAssign(id),
      assignee
    );
    return unwrap(res);
  },

  // --- Vendors ---

  /** GET /maintenance/vendors. */
  async listVendors(): Promise<Vendor[]> {
    const res = await apiClient.get<ApiResponse<Vendor[]>>(
      endpointsV2.maintenance.vendors
    );
    return unwrap(res);
  },

  /** POST /maintenance/vendors. */
  async createVendor(payload: CreateVendorRequest): Promise<Vendor> {
    const res = await apiClient.post<ApiResponse<Vendor>>(
      endpointsV2.maintenance.vendors,
      payload
    );
    return unwrap(res);
  },

  /** GET /maintenance/sla-summary — operational KPIs for the maintenance queue. */
  async slaSummary(): Promise<SlaSummary> {
    const res = await apiClient.get<ApiResponse<SlaSummary>>(
      endpointsV2.maintenance.slaSummary
    );
    return unwrap(res);
  },

  /** Upload an image file, returns the hosted URL to attach to a request. */
  async uploadPhoto(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file as any);
    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      endpointsV2.uploads.maintenancePhoto,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap(res);
  },

  /** Append a photo URL to an existing request. */
  async addPhoto(id: number | string, photoUrl: string): Promise<void> {
    const res = await apiClient.post<ApiResponse<void>>(
      endpointsV2.maintenance.requestPhotos(id),
      { photoUrl }
    );
    unwrap(res);
  },
};
