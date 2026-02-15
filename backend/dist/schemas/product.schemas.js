"use strict";
/**
 * Schemas de Validación para Productos
 *
 * Define los schemas de Zod para validar datos de productos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para crear producto
 */
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(120, 'El nombre no puede exceder 120 caracteres')
        .trim(),
    code: zod_1.z.string()
        .min(1, 'El código es requerido')
        .min(3, 'El código debe tener al menos 3 caracteres')
        .max(50, 'El código no puede exceder 50 caracteres')
        .trim()
        .toUpperCase(),
    price: zod_1.z.number()
        .positive('El precio debe ser mayor a 0')
        .min(0.01, 'El precio mínimo es 0.01'),
    description: zod_1.z.string()
        .trim()
        .optional()
        .default(''),
    category: zod_1.z.string()
        .min(1, 'La categoría es requerida')
        .trim(),
    imageUrl: zod_1.z.union([
        zod_1.z.string()
            .refine((val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'), 'La imagen debe ser una URL válida o una imagen en base64'),
        zod_1.z.undefined()
    ]).optional(),
    stock: zod_1.z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .default(0)
});
/**
 * Schema para actualizar producto
 */
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'El nombre debe tener al menos 3 caracteres')
        .max(120, 'El nombre no puede exceder 120 caracteres')
        .trim()
        .optional(),
    price: zod_1.z.number()
        .positive('El precio debe ser mayor a 0')
        .min(0.01, 'El precio mínimo es 0.01')
        .optional(),
    description: zod_1.z.string()
        .trim()
        .optional(),
    category: zod_1.z.string()
        .min(1, 'La categoría es requerida')
        .trim()
        .optional(),
    imageUrl: zod_1.z.union([
        zod_1.z.string()
            .refine((val) => val === '' || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'), 'La imagen debe ser una URL válida o una imagen en base64'),
        zod_1.z.undefined()
    ]).optional(),
    stock: zod_1.z.number()
        .int('El stock debe ser un número entero')
        .min(0, 'El stock no puede ser negativo')
        .optional()
});
