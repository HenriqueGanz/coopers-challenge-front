import { api } from './api';
import type {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
} from '../types';

export async function login(data: LoginInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function signup(data: SignupInput): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/auth/signup', data);
  return res.data;
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ success: true }> {
  const res = await api.post<{ success: true }>('/auth/forgot-password', data);
  return res.data;
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ success: true }> {
  const res = await api.post<{ success: true }>('/auth/reset-password', data);
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}
