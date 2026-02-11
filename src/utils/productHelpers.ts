/**
 * Product Helpers
 * 
 * Utilidades para trabajar con productos del backend
 */

import { Product } from '@/types';

/**
 * Obtener la URL de la imagen del producto
 * Compatible con productos del backend (imageUrl) y frontend antiguo (image)
 */
export function getProductImage(product: Product): string {
  return product.imageUrl || product.image || '/placeholder.svg';
}

/**
 * Formatear precio
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Verificar si hay stock disponible
 */
export function hasStock(product: Product): boolean {
  return product.stock > 0;
}

/**
 * Obtener mensaje de stock
 */
export function getStockMessage(product: Product): string {
  if (product.stock === 0) {
    return 'Sin stock';
  }
  if (product.stock < 5) {
    return `Solo ${product.stock} disponibles`;
  }
  return 'En stock';
}
