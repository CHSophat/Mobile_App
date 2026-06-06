import { apiClient } from './apiClient';
import { endpointsV2 } from './endpoints';

// --- DTOs (mirror Apartement_Service ProductDto + responses) ----------------

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

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UnitsFilter {
  page?: number;
  pageSize?: number;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

function toQuery(params: Record<string, unknown>): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length ? `?${pairs.join('&')}` : '';
}

// --- Service ----------------------------------------------------------------

class ProductService {
  /**
   * Public endpoint — does not require auth.
   */
  async listUnits(filter: UnitsFilter = {}): Promise<ApiEnvelope<PaginatedResponse<ProductDto>>> {
    return apiClient.get(`${endpointsV2.products.units}${toQuery(filter)}`);
  }

  /**
   * Public endpoint — vacant units only.
   */
  async listAvailable(
    filter: UnitsFilter = {}
  ): Promise<ApiEnvelope<PaginatedResponse<ProductDto>>> {
    return apiClient.get(`${endpointsV2.products.available}${toQuery(filter)}`);
  }

  async getById(id: number): Promise<ApiEnvelope<ProductDto>> {
    return apiClient.get(endpointsV2.products.byId(id));
  }

  async getPhotos(id: number): Promise<ApiEnvelope<ProductPhotoDto[]>> {
    return apiClient.get(endpointsV2.products.photos(id));
  }

  async search(query: string, filter: UnitsFilter = {}): Promise<ApiEnvelope<PaginatedResponse<ProductDto>>> {
    return apiClient.get(`${endpointsV2.products.search}${toQuery({ q: query, ...filter })}`);
  }
}

export const productService = new ProductService();
export default productService;
