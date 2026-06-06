import { apiClient } from './apiClient';
import { endpoints } from './endpoints';
import { MaintenanceRequest, MaintenanceTicket } from '@types/maintenance.types';

export class MaintenanceService {
  public async getRequests(): Promise<MaintenanceRequest[]> {
    const response = await apiClient.get<MaintenanceRequest[]>(
      endpoints.maintenance.requests
    );
    return response.data || [];
  }

  public async getRequest(requestId: string): Promise<MaintenanceRequest> {
    const response = await apiClient.get<MaintenanceRequest>(
      endpoints.maintenance.requestDetail(requestId)
    );
    return response.data!;
  }

  public async createRequest(data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const response = await apiClient.post<MaintenanceRequest>(
      endpoints.maintenance.createRequest,
      data
    );
    return response.data!;
  }

  public async updateRequest(
    requestId: string,
    data: Partial<MaintenanceRequest>
  ): Promise<MaintenanceRequest> {
    const response = await apiClient.put<MaintenanceRequest>(
      endpoints.maintenance.updateRequest(requestId),
      data
    );
    return response.data!;
  }

  public async getTickets(): Promise<MaintenanceTicket[]> {
    const response = await apiClient.get<MaintenanceTicket[]>(
      endpoints.maintenance.tickets
    );
    return response.data || [];
  }

  public async getTicket(ticketId: string): Promise<MaintenanceTicket> {
    const response = await apiClient.get<MaintenanceTicket>(
      endpoints.maintenance.ticketDetail(ticketId)
    );
    return response.data!;
  }

  public async addTicketComment(
    ticketId: string,
    message: string,
    attachments?: string[]
  ): Promise<MaintenanceTicket> {
    const response = await apiClient.post<MaintenanceTicket>(
      `${endpoints.maintenance.ticketDetail(ticketId)}/comments`,
      { message, attachments }
    );
    return response.data!;
  }
}

export const maintenanceService = new MaintenanceService();
