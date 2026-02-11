/**
 * Schemas de Validación para Carrito
 * 
 * Define los schemas de Zod para validar operaciones del carrito.
 */

import { z } from 'zod';

/**
 * Schema para agregar al carrito
 */
export const addToCartSchema = z.object({
    productId: z.string()
        .min(1, 'El ID del producto es requerido'),

    quantity: z.number()
        .int('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
});

/**
 * Schema para actualizar item del carrito
 */
export const updateCartItemSchema = z.object({
    quantity: z.number()
        .int('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
});

/**
 * Tipos inferidos
 */
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
