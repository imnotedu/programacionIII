/**
 * Servicio API Base
 * 
 * Configuración base para todas las llamadas al backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtener token del localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Configurar headers con autenticación
 */
function getHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Manejar respuesta de la API
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    // Si hay errores de validación específicos, mostrarlos
    if (data.errors && Array.isArray(data.errors)) {
      const details = data.errors.map((e: { field: string; message: string }) => e.message).join('. ');
      throw new Error(details || data.message || 'Error en la petición');
    }
    throw new Error(data.message || 'Error en la petición');
  }

  return data.data;
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders(requiresAuth),
  });

  return handleResponse<T>(response);
}

/**
 * POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body: any,
  requiresAuth: boolean = false
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(requiresAuth),
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

/**
 * PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body: any,
  requiresAuth: boolean = false
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(requiresAuth),
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

/**
 * DELETE request
 */
export async function apiDelete<T>(
  endpoint: string,
  requiresAuth: boolean = false
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(requiresAuth),
  });

  return handleResponse<T>(response);
}
