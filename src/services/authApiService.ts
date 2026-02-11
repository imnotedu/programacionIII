/**
 * Servicio de Autenticación con Backend
 * 
 * Maneja login, registro y autenticación con el backend.
 */

import { apiPost, apiGet } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  level: 'admin' | 'usuario';
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Login de usuario
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/auth/login', credentials);
  
  // Guardar token en localStorage
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  
  return response;
}

/**
 * Registro de usuario
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiPost<AuthResponse>('/auth/register', data);
  
  // Guardar token en localStorage
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.user));
  
  return response;
}

/**
 * Obtener perfil del usuario autenticado
 */
export async function getProfile(): Promise<{ user: User }> {
  return apiGet<{ user: User }>('/auth/me', true);
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Obtener usuario del localStorage
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Verificar si hay sesión activa
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}
