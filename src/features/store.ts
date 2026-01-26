// src/features/store.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cart/cartSlice';
import filtersReducer from './filters/filtersSlice';
import authReducer from './auth/authSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;