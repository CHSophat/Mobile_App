import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import unitReducer from './slices/unitSlice';
import paymentReducer from './slices/paymentSlice';
import maintenanceReducer from './slices/maintenanceSlice';
import communicationReducer from './slices/communicationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    unit: unitReducer,
    payment: paymentReducer,
    maintenance: maintenanceReducer,
    communication: communicationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredActionPaths: ['payload'],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
