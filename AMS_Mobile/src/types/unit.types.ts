export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  type: 'apartment' | 'house' | 'room' | 'office' | 'commercial';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  bedrooms: number;
  bathrooms: number;
  area: number; // in square meters
  floor?: number;
  images: string[];
  amenities: string[];
  description?: string;
  pricing: UnitPricing;
  lease?: Lease;
  owner: UserRef;
  createdAt: string;
  updatedAt: string;
}

export interface UnitPricing {
  rentPrice: number;
  deposit: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  availableFrom: string;
  minimumLeaseLength?: number; // in months
  utilities?: UtilityCharges;
}

export interface UtilityCharges {
  water?: number;
  electricity?: number;
  internet?: number;
  maintenance?: number;
  parking?: number;
  other?: Record<string, number>;
}

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentPrice: number;
  deposit: number;
  terms?: string;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRef {
  id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
}

export interface UnitFilter {
  type?: string[];
  status?: string[];
  bedroomMin?: number;
  bedroomMax?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  sortBy?: 'price' | 'newest' | 'area';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UnitState {
  units: Unit[];
  filteredUnits: Unit[];
  selectedUnit: Unit | null;
  isLoading: boolean;
  error: string | null;
  filters: UnitFilter;
  totalCount: number;
}
