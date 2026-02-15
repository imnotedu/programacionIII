"use strict";
/**
 * Schemas de Validación para Carrito
 *
 * Define los schemas de Zod para validar operaciones del carrito.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para agregar al carrito
 */
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string()
        .min(1, 'El ID del producto es requerido'),
    quantity: zod_1.z.number()
        .int('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
});
/**
 * Schema para actualizar item del carrito
 */
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number()
        .int('La cantidad debe ser un número entero')
        .min(1, 'La cantidad mínima es 1')
});
