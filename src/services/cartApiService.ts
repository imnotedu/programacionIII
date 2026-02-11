/**
 * Servicio de Carrito con Backend
 * 
 * Maneja operaciones del carrito de compras.
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { Product } from './productApiService';

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  subtotal: number;
}

export interface CartData {
  cart: Cart;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

/**
 * Obtener carrito del usuario
 */
export async function getCart(): Promise<CartData> {
  return apiGet<CartData>('/cart', true);
}

/**
 * Agregar producto al carrito
 */
export async function addToCart(data: AddToCartData): Promise<{ item: CartItem; message: string }> {
  return apiPost<{ item: CartItem; message: string }>('/cart/items', data, true);
}

/**
 * Actualizar cantidad de un producto
 */
export async function updateCartItem(
  productId: string,
  data: UpdateCartItemData
): Promise<{ item: CartItem; message: string }> {
  return apiPut<{ item: CartItem; message: string }>(`/cart/items/${productId}`, data, true);
}

/**
 * Eliminar producto del carrito
 */
export async function removeFromCart(productId: string): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/cart/items/${productId}`, true);
}

/**
 * Limpiar carrito completo
 */
export async function clearCart(): Promise<{ message: string }> {
  return apiDelete<{ message: string }>('/cart', true);
}

/**
 * Procesar checkout (compra)
 * Descuenta stock y vacía el carrito
 */
export async function checkout(): Promise<{ message: string; itemsProcessed: number; totalItems: number }> {
  return apiPost<{ message: string; itemsProcessed: number; totalItems: number }>('/cart/checkout', {}, true);
}
