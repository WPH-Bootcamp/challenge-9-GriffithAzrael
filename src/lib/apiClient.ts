export const API_BASE_URL =
  "https://restaurant-be-400174736012.asia-southeast2.run.app";

// TODO: ganti dengan path endpoint yang benar dari Swagger
const LOGIN_PATH = "/api/auth/login";
const REGISTER_PATH = "/api/auth/register";

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    // Coba ambil pesan error dari body
    const data = (await res.json().catch(() => null)) as
      | { message?: string }
      | null;
    const message =
      data?.message || `Request gagal dengan status ${res.status}`;
    throw new Error(message);
  }
  return (await res.json().catch(() => null)) as any;
}

export async function loginApi(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function registerApi(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}${REGISTER_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}