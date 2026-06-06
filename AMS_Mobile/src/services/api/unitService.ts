import { apiClient } from './apiClient';
import { endpoints } from './endpoints';
import { Unit } from '@types/unit.types';

export class UnitService {
  public async getUnits(
    filters?: any,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ units: Unit[]; total: number }> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      ...filters,
    });

    const response = await apiClient.get<{ units: Unit[]; total: number }>(
      `${endpoints.units.list}?${queryParams.toString()}`
    );
    return response.data || { units: [], total: 0 };
  }

  public async searchUnits(query: string): Promise<Unit[]> {
    const response = await apiClient.get<Unit[]>(
      `${endpoints.units.search}?query=${query}`
    );
    return response.data || [];
  }

  public async getUnit(unitId: string): Promise<Unit> {
    const response = await apiClient.get<Unit>(
      endpoints.units.detail(unitId)
    );
    return response.data!;
  }

  public async createUnit(unitData: Partial<Unit>): Promise<Unit> {
    const response = await apiClient.post<Unit>(
      endpoints.units.create,
      unitData
    );
    return response.data!;
  }

  public async updateUnit(
    unitId: string,
    unitData: Partial<Unit>
  ): Promise<Unit> {
    const response = await apiClient.put<Unit>(
      endpoints.units.update(unitId),
      unitData
    );
    return response.data!;
  }

  public async deleteUnit(unitId: string): Promise<void> {
    await apiClient.delete(endpoints.units.delete(unitId));
  }

  public async uploadUnitImages(
    unitId: string,
    images: string[]
  ): Promise<Unit> {
    const response = await apiClient.post<Unit>(
      endpoints.units.images(unitId),
      { images }
    );
    return response.data!;
  }
}

export const unitService = new UnitService();
