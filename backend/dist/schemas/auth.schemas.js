"use strict";
/**
 * Schemas de Validación para Autenticación
 *
 * Define los schemas de Zod para validar datos de autenticación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema para login
 */
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .min(1, 'El correo electrónico es requerido')
        .email('Formato de correo electrónico inválido')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
});
/**
 * Schema para registro
 */
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
        .trim(),
    email: zod_1.z.string()
        .min(1, 'El correo electrónico es requerido')
        .email('Formato de correo electrónico inválido')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(1, 'La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña no puede exceder 100 caracteres')
});
