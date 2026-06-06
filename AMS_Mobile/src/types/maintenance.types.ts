export interface MaintenanceRequest {
  id: string;
  propertyId: string;
  unitId: string;
  requesterId: string;
  assignedTo?: string;
  category: MaintenanceCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  estimatedCost?: number;
  actualCost?: number;
  completionDate?: string;
  notes?: MaintenanceNote[];
  createdAt: string;
  updatedAt: string;
}

export enum MaintenanceCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  HVAC = 'hvac',
  APPLIANCE = 'appliance',
  PAINTING = 'painting',
  FLOORING = 'flooring',
  STRUCTURAL = 'structural',
  PEST_CONTROL = 'pest_control',
  CLEANING = 'cleaning',
  SECURITY = 'security',
  LANDSCAPING = 'landscaping',
  OTHER = 'other',
}

export interface MaintenanceNote {
  id: string;
  createdBy: string;
  createdByName: string;
  content: string;
  createdAt: string;
}

export interface MaintenanceTicket {
  id: string;
  maintenanceRequestId: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  conversation?: MaintenanceConversation[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceConversation {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface MaintenanceSchedule {
  id: string;
  maintenanceRequestId: string;
  scheduledDate: string;
  technician: {
    id: string;
    name: string;
    phone?: string;
    rating?: number;
  };
  estimatedDuration?: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface MaintenanceState {
  requests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;
  isLoading: boolean;
  error: string | null;
  filters: MaintenanceFilter;
}

export interface MaintenanceFilter {
  status?: string[];
  category?: string[];
  severity?: string[];
  assignedToMe?: boolean;
  sortBy?: 'date' | 'severity' | 'status';
  page?: number;
  limit?: number;
}
