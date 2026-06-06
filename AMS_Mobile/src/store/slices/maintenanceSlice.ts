import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MaintenanceState, MaintenanceRequest } from '@types/maintenance.types';

const initialState: MaintenanceState = {
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    setRequests: (state, action: PayloadAction<MaintenanceRequest[]>) => {
      state.requests = action.payload;
      state.isLoading = false;
    },
    setSelectedRequest: (
      state,
      action: PayloadAction<MaintenanceRequest | null>
    ) => {
      state.selectedRequest = action.payload;
    },
    addRequest: (state, action: PayloadAction<MaintenanceRequest>) => {
      state.requests.unshift(action.payload);
    },
    updateRequest: (state, action: PayloadAction<MaintenanceRequest>) => {
      const index = state.requests.findIndex(
        (r) => r.id === action.payload.id
      );
      if (index !== -1) {
        state.requests[index] = action.payload;
        if (state.selectedRequest?.id === action.payload.id) {
          state.selectedRequest = action.payload;
        }
      }
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
  setRequests,
  setSelectedRequest,
  addRequest,
  updateRequest,
  setLoading,
  setError,
} = maintenanceSlice.actions;
export default maintenanceSlice.reducer;
