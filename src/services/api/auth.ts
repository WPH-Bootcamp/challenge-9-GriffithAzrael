// src/services/api/auth.ts
import api from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string; // sesuai Swagger: field "phone"
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// Helper: ambil message dari body
const getMessage = (body: any, fallback: string) =>
  (body && typeof body.message === 'string' && body.message) || fallback;

// LOGIN
export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', payload);
  const body: any = res.data;

  // Ekspektasi Swagger:
  // { success: true, message: "Login successful", data: { user: {...}, token: "..." } }
  const apiData = body?.data;
  if (!apiData) {
    throw new Error(getMessage(body, 'Login gagal. Silakan coba lagi.'));
  }

  const userRaw = apiData.user;
  const token = apiData.token;

  if (!userRaw || !token) {
    throw new Error(getMessage(body, 'Login gagal. Silakan coba lagi.'));
  }

  const user: AuthUser = {
    id: String(userRaw.id),
    name: userRaw.name,
    email: userRaw.email,
    phoneNumber: userRaw.phone,
    avatar: userRaw.avatar,
  };

  return { token, user };
};

// REGISTER
export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', payload);
  const body: any = res.data;

  // Ekspektasi Swagger:
  // { success: true, message: "User registered successfully", data: { user: {...}, token: "..." } }
  const apiData = body?.data;
  if (!apiData) {
    throw new Error(getMessage(body, 'Register gagal. Silakan coba lagi.'));
  }

  const userRaw = apiData.user;
  const token = apiData.token;

  if (!userRaw || !token) {
    throw new Error(getMessage(body, 'Register gagal. Silakan coba lagi.'));
  }

  const user: AuthUser = {
    id: String(userRaw.id),
    name: userRaw.name,
    email: userRaw.email,
    phoneNumber: userRaw.phone,
  };

  return { token, user };
};

// ---------- PROFILE ----------

export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  [key: string]: any;
}

export const getProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/auth/profile');
  const body: any = res.data;

  // Ekspektasi: { success, message, data: { ...user } }
  const apiData = body?.data ?? body;
  if (!apiData) {
    throw new Error(getMessage(body, 'Gagal mengambil profil pengguna.'));
  }

  return apiData as UserProfile;
};