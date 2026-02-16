/**
 * Schemas de Validación para Productos
 * 
 * Define los schemas de Zod para validar datos de productos.
 */

import { z } from 'zod';

/**
 * Schema para crear producto
 */
export const createProductSchema = z.object({
    name: z.string()
        .min(1, 'El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(120, 'El nombre no puede exceder 120 caracteres')
        .trim(),

    code: z.string()
        .min(1, 'El código es requerido')
        .min(3, 'El código debe tener al menos 3 caracteres')
        .max(50, 'El código no puede exceder 50 caracteres')
        .trim()
        .toUpperCase(),

    price: z.number()
        .positive('El precio debe ser mayor a 0')
        .min(0.01, 'El precio mínimo es 0.01'),

    description: z.string()
        .trim()
        .optional()
        .default(''),

    category: z.string()
        .min(1, 'La categoría es requerida')
        .trim(),

    imageUrl: z.union([
        z.string()
            .refine(
                (val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/') || val.startsWith('/'),
                'La imagen debe ser una URL válida, una ruta local o una imagen en base64'
            ),
        z.undefined()
    ]).optional(),

    stock: z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .default(0)
});

/**
 * Schema para actualizar producto
 */
export const updateProductSchema = z.object({
    name: z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(120, 'El nombre no puede exceder 120 caracteres')
        .trim()
        .optional(),

    price: z.number()
        .positive('El precio debe ser mayor a 0')
        .min(0.01, 'El precio mínimo es 0.01')
        .optional(),

    description: z.string()
        .trim()
        .optional(),

    category: z.string()
        .min(1, 'La categoría es requerida')
        .trim()
        .optional(),

    imageUrl: z.union([
        z.string()
            .refine(
                (val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/') || val.startsWith('/'),
                'La imagen debe ser una URL válida, una ruta local o una imagen en base64'
            ),
        z.undefined()
    ]).optional(),

    stock: z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .optional()
});

/**
 * Tipos inferidos
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
