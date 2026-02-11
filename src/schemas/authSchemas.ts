/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating authentication forms and data.
 * These schemas ensure data integrity and provide user-friendly error messages.
 */

import { z } from 'zod';

/**
 * Login Schema
 * 
 * Validates login form data including email and password.
 * 
 * Requirements:
 * - Email: required, valid email format
 * - Password: required, minimum 6 characters, not just whitespace
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .trim()
    .toLowerCase(),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .refine((val) => val.trim().length >= 6, {
      message: 'La contraseña no puede ser solo espacios en blanco'
    })
});

/**
 * Type inference for login form data
 */
export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register Schema
 * 
 * Valida los datos del formulario de registro.
 * NOTA: El campo 'level' no se incluye porque todos los registros son 'usuario' automáticamente.
 * Solo el superadmin tiene nivel 'admin'.
 * 
 * Requisitos:
 * - Nombre: requerido, mínimo 2 caracteres, solo letras y espacios
 * - Email: requerido, formato válido
 * - Contraseña: requerida, mínimo 6 caracteres, no solo espacios
 * - Confirmar Contraseña: requerida, debe coincidir con la contraseña
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    )
    .refine((val) => val.trim().length >= 2, {
      message: 'El nombre no puede ser solo espacios en blanco'
    }),
  
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .trim()
    .toLowerCase(),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .refine((val) => val.trim().length >= 6, {
      message: 'La contraseña no puede ser solo espacios en blanco'
    }),
  
  confirmPassword: z
    .string()
    .min(1, 'Debes confirmar la contraseña')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

/**
 * Type inference for register form data
 */
export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Password Change Schema
 * 
 * Validates password change form data.
 * Useful for future password change functionality.
 */
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'La contraseña actual es requerida'),
  
  newPassword: z
    .string()
    .min(1, 'La nueva contraseña es requerida')
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    .max(100, 'La nueva contraseña no puede exceder 100 caracteres'),
  
  confirmNewPassword: z
    .string()
    .min(1, 'Debes confirmar la nueva contraseña')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});

/**
 * Type inference for password change form data
 */
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

/**
 * Email Schema
 * 
 * Validates a single email address.
 * Useful for email-only forms like password reset.
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido')
    .trim()
    .toLowerCase()
});

/**
 * Type inference for email form data
 */
export type EmailFormData = z.infer<typeof emailSchema>;

/**
 * User Level Schema
 * 
 * Validates user level selection.
 */
export const userLevelSchema = z.enum(['admin', 'usuario'], {
  required_error: 'Debes seleccionar un nivel de usuario',
  invalid_type_error: 'El nivel debe ser "admin" o "usuario"'
});

/**
 * Type inference for user level
 */
export type UserLevelType = z.infer<typeof userLevelSchema>;
