import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentState, Payment, PaymentMethod } from '@types/payment.types';

const initialState: PaymentState = {
  payments: [],
  paymentMethods: [],
  selectedPaymentMethod: null,
  isLoading: false,
  error: null,
  currentBakongQR: null,
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
      state.isLoading = false;
    },
    setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
      state.paymentMethods = action.payload;
    },
    setSelectedPaymentMethod: (
      state,
      action: PayloadAction<PaymentMethod | null>
    ) => {
      state.selectedPaymentMethod = action.payload;
    },
    setBakongQR: (state, action) => {
      state.currentBakongQR = action.payload;
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload);
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
  setPayments,
  setPaymentMethods,
  setSelectedPaymentMethod,
  setBakongQR,
  addPayment,
  setLoading,
  setError,
} = paymentSlice.actions;
export default paymentSlice.reducer;
