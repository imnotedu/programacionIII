/**
 * Servicio de Productos con Backend
 * 
 * Maneja operaciones CRUD de productos.
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api';

export interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
  // Campos opcionales para compatibilidad con frontend
  image?: string;
  isNew?: boolean;
  isSale?: boolean;
  originalPrice?: number;
}

export interface CreateProductData {
  name: string;
  code: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  stock?: number;
}

/**
 * Obtener todos los productos
 */
export async function getAllProducts(): Promise<{ products: Product[]; count: number }> {
  return apiGet<{ products: Product[]; count: number }>('/products');
}

/**
 * Obtener producto por ID
 */
export async function getProductById(id: string): Promise<{ product: Product }> {
  return apiGet<{ product: Product }>(`/products/${id}`);
}

/**
 * Obtener producto por código
 */
export async function getProductByCode(code: string): Promise<{ product: Product }> {
  return apiGet<{ product: Product }>(`/products/code/${code}`);
}

/**
 * Crear producto (solo admin)
 */
export async function createProduct(data: CreateProductData): Promise<{ product: Product }> {
  return apiPost<{ product: Product }>('/products', data, true);
}

/**
 * Actualizar producto (solo admin)
 */
export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<{ product: Product }> {
  return apiPut<{ product: Product }>(`/products/${id}`, data, true);
}

/**
 * Eliminar producto (solo admin)
 */
export async function deleteProduct(id: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/products/${id}`, true);
}
