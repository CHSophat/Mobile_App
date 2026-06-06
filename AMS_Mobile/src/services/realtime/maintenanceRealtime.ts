/**
 * Realtime maintenance status updates.
 *
 * Uses Socket.IO for now (already installed). When the backend ships SignalR
 * hubs at /hubs/maintenance, swap the transport in `connect()` for
 * @microsoft/signalr's HubConnectionBuilder — the public API of this module
 * stays the same so callers don't change.
 */

import { io, Socket } from 'socket.io-client';
import { envService } from '../environment.service';
import { tokenStorage } from '@services/api/apiClient';
import type {
  MaintenanceRequest,
  MaintenanceStatus,
} from '@services/api/maintenanceServiceV2';

export type MaintenanceEvent =
  | { type: 'status_changed'; requestId: number; status: MaintenanceStatus; updatedAt: string }
  | { type: 'response_added'; requestId: number; note: string; updatedAt: string }
  | { type: 'photo_added'; requestId: number; photoUrl: string }
  | { type: 'created'; request: MaintenanceRequest };

export type MaintenanceListener = (event: MaintenanceEvent) => void;

class MaintenanceRealtime {
  private socket: Socket | null = null;
  private listeners = new Set<MaintenanceListener>();
  private connecting = false;

  async connect(): Promise<void> {
    if (this.socket?.connected || this.connecting) return;
    this.connecting = true;
    try {
      const token = await tokenStorage.getAccessToken();
      // Strip /api/v1 suffix — Socket.IO hub lives at the server root, not inside the REST prefix.
      const baseUrl = envService.getApiBaseUrl().replace(/\/api\/v\d+\/?$/, '');
      this.socket = io(`${baseUrl}/hubs/maintenance`, {
        transports: ['websocket'],
        auth: token ? { token } : undefined,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.socket.on('event', (payload: MaintenanceEvent) => {
        this.listeners.forEach((l) => l(payload));
      });

      this.socket.on('connect_error', (err) => {
        // Backend hub may not be live yet — swallow so the app still runs.
        if (__DEV__) console.warn('[maintenance-rt] connect_error', err.message);
      });
    } finally {
      this.connecting = false;
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  subscribe(listener: MaintenanceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Manually broadcast (mostly useful in tests). */
  emit(event: MaintenanceEvent): void {
    this.listeners.forEach((l) => l(event));
  }
}

export const maintenanceRealtime = new MaintenanceRealtime();
