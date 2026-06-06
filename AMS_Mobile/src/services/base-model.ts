/**
 * Base Model interface for all API models
 * Provides common properties and methods
 */
export interface IBaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}

/**
 * Base Model abstract class
 * Provides common functionality for all models
 */
export abstract class BaseModel implements IBaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean = false;

  constructor(data: Partial<IBaseModel> = {}) {
    this.id = data.id || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.isDeleted = data.isDeleted || false;
  }

  /**
   * Convert model to plain object
   */
  toJSON(): any {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isDeleted: this.isDeleted,
    };
  }

  /**
   * Create model from plain object
   */
  static fromJSON<T extends BaseModel>(data: any): T {
    return new (this as any)(data);
  }

  /**
   * Check if model is valid
   */
  isValid(): boolean {
    return !!this.id;
  }

  /**
   * Check if model is new (not yet saved)
   */
  isNew(): boolean {
    return !this.id;
  }

  /**
   * Get creation time difference in seconds
   */
  getAgeInSeconds(): number {
    return Math.floor((Date.now() - this.createdAt.getTime()) / 1000);
  }

  /**
   * Format date to string
   */
  protected formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
    // Simple date formatting - can be replaced with a library like date-fns
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day);
  }
}

/**
 * Request/Response wrapper models
 */
export class PagedRequest {
  pageNumber: number = 1;
  pageSize: number = 10;
  sortBy?: string;
  sortOrder: 'asc' | 'desc' = 'desc';

  constructor(pageNumber: number = 1, pageSize: number = 10) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}

export interface PagedResponse<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Filter model for search operations
 */
export class FilterModel {
  searchText?: string;
  filters: Map<string, any> = new Map();
  sortBy: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  addFilter(key: string, value: any): this {
    this.filters.set(key, value);
    return this;
  }

  removeFilter(key: string): this {
    this.filters.delete(key);
    return this;
  }

  clearFilters(): this {
    this.filters.clear();
    return this;
  }

  getFilterObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    this.filters.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }
}

/**
 * Status enum for common status fields
 */
export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}
