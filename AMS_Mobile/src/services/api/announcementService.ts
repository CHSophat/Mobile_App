import { apiClient, ApiResponse, unwrap } from './apiClient';
import { endpointsV2 } from './endpoints';

export type AnnouncementAudience = 'all' | 'tenants' | 'owners' | 'staff' | 'property' | 'custom';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'sent' | 'archived';

export interface Announcement {
  id: number;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  propertyId: number | null;
  coverUrl: string | null;
  publishAt: string | null;
  sentAt: string | null;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  propertyId?: number;
  coverUrl?: string;
  /** ISO date; when set the announcement is scheduled instead of sent immediately. */
  publishAt?: string;
}

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface AnnouncementDelivery {
  id: number;
  announcementId: number;
  recipientId: number;
  recipientName: string | null;
  channel: 'in_app' | 'email' | 'sms' | 'push';
  status: DeliveryStatus;
  sentAt: string | null;
  readAt: string | null;
}

export const announcementService = {
  /** Tenant-scoped feed of announcements the current user can see. */
  async list(): Promise<Announcement[]> {
    const res = await apiClient.get<ApiResponse<Announcement[]>>(endpointsV2.announcements.list);
    return unwrap(res);
  },

  async byId(id: number | string): Promise<Announcement> {
    const res = await apiClient.get<ApiResponse<Announcement>>(endpointsV2.announcements.byId(id));
    return unwrap(res);
  },

  /** Create a draft/scheduled announcement (admin/owner). */
  async create(payload: CreateAnnouncementRequest): Promise<Announcement> {
    const res = await apiClient.post<ApiResponse<Announcement>>(
      endpointsV2.announcements.create,
      payload
    );
    return unwrap(res);
  },

  /** Publish an announcement immediately (admin/owner). */
  async sendNow(id: number | string): Promise<Announcement> {
    const res = await apiClient.post<ApiResponse<Announcement>>(
      endpointsV2.announcements.sendNow(id),
      {}
    );
    return unwrap(res);
  },

  /** Per-recipient delivery status for an announcement (admin/owner). */
  async getDeliveries(id: number | string): Promise<AnnouncementDelivery[]> {
    const res = await apiClient.get<ApiResponse<AnnouncementDelivery[]>>(
      endpointsV2.announcements.deliveries(id)
    );
    return unwrap(res);
  },

  /** Upload a cover image and get back its hosted URL. */
  async uploadCover(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<{ url: string }> {
    const form = new FormData();
    form.append('file', file as any);
    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      endpointsV2.announcements.coverUpload,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrap(res);
  },
};
