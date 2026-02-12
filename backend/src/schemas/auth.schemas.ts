/**
 * Schemas de Validación para Autenticación
 * 
 * Define los schemas de Zod para validar datos de autenticación.
 */

import { z } from 'zod';

/**
 * Schema para login
 */
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

/**
 * Schema para registro
 */
export const registerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')
    .trim(),

  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .toLowerCase()
    .trim(),

  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres'),

  level: z.enum(['admin', 'usuario'], {
    errorMap: () => ({ message: 'El nivel debe ser admin o usuario' })
  }).optional().default('usuario')
});

/**
 * Tipos inferidos
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
