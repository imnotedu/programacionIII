/**
 * Middleware de Manejo de Errores
 * 
 * Captura y procesa todos los errores de la aplicación.
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

/**
 * Middleware global de manejo de errores
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log del error (solo mensaje y stack)
  console.error('❌ Error:', err.message);
  if (err.stack) {
    console.error(err.stack);
  }

  // Error de validación de Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Error de aplicación personalizado
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  // Error desconocido
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`
  });
}
