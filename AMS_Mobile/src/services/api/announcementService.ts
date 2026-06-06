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
};
