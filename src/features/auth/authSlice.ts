// src/features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

export interface AuthUser {
  id?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  error: string | null;
  lastLoginAt: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: 'idle',
  error: null,
  lastLoginAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Dipanggil secara optimistic sebelum request login selesai
    loginOptimistic(state, action: PayloadAction<{ email: string }>) {
      state.user = { email: action.payload.email };
      state.status = 'authenticated';
      state.error = null;
      state.lastLoginAt = dayjs().toISOString();
    },
    // Untuk rollback state jika optimistic login gagal
    restoreAuthState(_state, action: PayloadAction<AuthState>) {
      return action.payload;
    },
    setAuthSuccess(
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = 'authenticated';
      state.error = null;
      state.lastLoginAt = dayjs().toISOString();
    },
    setAuthError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
      state.user = null;
      state.token = null;
    },
    logout() {
      localStorage.removeItem('accessToken');
      return initialState;
    },
  },
});

export const {
  loginOptimistic,
  restoreAuthState,
  setAuthSuccess,
  setAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;