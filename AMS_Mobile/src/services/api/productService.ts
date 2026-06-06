import { apiClient, ApiResponse } from './apiClient';
import { endpointsV2 } from './endpoints';

export type ProductType = 'unit' | 'parking' | 'storage' | 'amenity';
export type ProductStatus = 'vacant' | 'occupied' | 'maintenance' | 'unavailable';

export interface ProductDto {
  id: number;
  productType: ProductType;
  code: string;
  name: string | null;
  description: string | null;
  status: ProductStatus;
  basePrice: number;
  squareFeet: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floorNumber: number | null;
  amenities: string[];
  primaryPhoto: string | null;
  photos: string[];
  attributes: Record<string, string> | null;
  utilityMeters: unknown;
  maintenanceStatus: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPhotoDto {
  id: number;
  productId: number;
  photoUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PaymentBreakdownDto {
  productId: number;
  baseRent: number;
  taxes: number;
  fees: number;
  totalMonthly: number;
  currency: string;
}

export interface PaginatedResponse<T> {
  // actual API shape
  products?: T[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  // fallback shapes
  items?: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface UnitsFilter {
  page?: number;
  pageSize?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export interface CreateProductDto {
  productType: ProductType;
  code: string;
  name?: string;
  description?: string;
  basePrice: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  floorNumber?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  basePrice?: number;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  floorNumber?: number;
}

export interface MaintenanceStatusDto {
  inMaintenance: boolean;
  notes?: string;
}

export interface MaintenanceRequestDto {
  id: number;
  productId: number;
  description: string;
  status: string;
  createdAt: string;
}

export interface BulkStatusDto {
  productIds: number[];
  status: ProductStatus;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQuery(params: Record<string, any>): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length ? `?${pairs.join('&')}` : '';
}

class ProductService {
  /** GET /api/v1/products/units */
  async listUnits(filter: UnitsFilter = {}): Promise<ApiResponse<PaginatedResponse<ProductDto>>> {
    return apiClient.get(`${endpointsV2.products.units}${toQuery(filter)}`);
  }

  /** GET /api/v1/products/units/available */
  async listAvailable(filter: UnitsFilter = {}): Promise<ApiResponse<PaginatedResponse<ProductDto>>> {
    return apiClient.get(`${endpointsV2.products.available}${toQuery(filter)}`);
  }

  /** GET /api/v1/products/{productId} */
  async getById(id: number): Promise<ApiResponse<ProductDto>> {
    return apiClient.get(endpointsV2.products.byId(id));
  }

  /** PUT /api/v1/products/{productId} */
  async update(id: number, data: UpdateProductDto): Promise<ApiResponse<ProductDto>> {
    return apiClient.put(endpointsV2.products.byId(id), data);
  }

  /** DELETE /api/v1/products/{productId} */
  async deleteProduct(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(endpointsV2.products.byId(id));
  }

  /** GET /api/v1/products/{id}/payment-breakdown */
  async getPaymentBreakdown(id: number): Promise<ApiResponse<PaymentBreakdownDto>> {
    return apiClient.get(endpointsV2.products.paymentBreakdown(id));
  }

  /** GET /api/v1/products/by-property */
  async getByProperty(
    propertyId: number | string,
    filter: UnitsFilter = {}
  ): Promise<ApiResponse<PaginatedResponse<ProductDto>>> {
    return apiClient.get(
      `${endpointsV2.products.byProperty}${toQuery({ propertyId, ...filter })}`
    );
  }

  /** GET /api/v1/products/search */
  async search(
    query: string,
    filter: UnitsFilter = {}
  ): Promise<ApiResponse<PaginatedResponse<ProductDto>>> {
    return apiClient.get(
      `${endpointsV2.products.search}${toQuery({ q: query, ...filter })}`
    );
  }

  /** GET /api/v1/products/{productId}/photos */
  async getPhotos(id: number): Promise<ApiResponse<ProductPhotoDto[]>> {
    return apiClient.get(endpointsV2.products.photos(id));
  }

  /** POST /api/v1/products/{productId}/photos */
  async addPhoto(
    id: number,
    data: { photoUrl: string; isPrimary?: boolean; sortOrder?: number }
  ): Promise<ApiResponse<ProductPhotoDto>> {
    return apiClient.post(endpointsV2.products.photos(id), data);
  }

  /** POST /api/v1/products */
  async create(data: CreateProductDto): Promise<ApiResponse<ProductDto>> {
    return apiClient.post(endpointsV2.products.create, data);
  }

  /** PATCH /api/v1/products/{productId}/status */
  async setStatus(id: number, status: ProductStatus): Promise<ApiResponse<ProductDto>> {
    return apiClient.patch(endpointsV2.products.setStatus(id), { status });
  }

  /** PATCH /api/v1/products/{productId}/maintenance */
  async setMaintenance(
    id: number,
    data: MaintenanceStatusDto
  ): Promise<ApiResponse<ProductDto>> {
    return apiClient.patch(endpointsV2.products.setMaintenance(id), data);
  }

  /** GET /api/v1/products/{productId}/maintenance-requests */
  async getMaintenanceRequests(id: number): Promise<ApiResponse<MaintenanceRequestDto[]>> {
    return apiClient.get(endpointsV2.products.maintenanceRequests(id));
  }

  /** PATCH /api/v1/products/bulk-status */
  async bulkUpdateStatus(data: BulkStatusDto): Promise<ApiResponse<void>> {
    return apiClient.patch(endpointsV2.products.bulkStatus, data);
  }
}

export const productService = new ProductService();
export default productService;
