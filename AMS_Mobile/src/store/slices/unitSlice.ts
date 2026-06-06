import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnitState, Unit, UnitFilter } from '@types/unit.types';

const initialState: UnitState = {
  units: [],
  filteredUnits: [],
  selectedUnit: null,
  isLoading: false,
  error: null,
  filters: {},
  totalCount: 0,
};

export const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {
    setUnits: (state, action: PayloadAction<{ units: Unit[]; total: number }>) => {
      state.units = action.payload.units;
      state.filteredUnits = action.payload.units;
      state.totalCount = action.payload.total;
      state.isLoading = false;
    },
    setSelectedUnit: (state, action: PayloadAction<Unit | null>) => {
      state.selectedUnit = action.payload;
    },
    setFilters: (state, action: PayloadAction<UnitFilter>) => {
      state.filters = action.payload;
    },
    filterUnits: (state) => {
      state.filteredUnits = state.units.filter((unit) => {
        const filters = state.filters;

        if (filters.type && !filters.type.includes(unit.type)) return false;
        if (filters.status && !filters.status.includes(unit.status)) return false;
        if (
          filters.bedroomMin !== undefined &&
          unit.bedrooms < filters.bedroomMin
        )
          return false;
        if (
          filters.bedroomMax !== undefined &&
          unit.bedrooms > filters.bedroomMax
        )
          return false;
        if (
          filters.priceMin !== undefined &&
          unit.pricing.rentPrice < filters.priceMin
        )
          return false;
        if (
          filters.priceMax !== undefined &&
          unit.pricing.rentPrice > filters.priceMax
        )
          return false;

        return true;
      });
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUnits,
  setSelectedUnit,
  setFilters,
  filterUnits,
  setLoading,
  setError,
} = unitSlice.actions;
export default unitSlice.reducer;
