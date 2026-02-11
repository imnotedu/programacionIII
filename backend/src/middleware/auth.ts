/**
 * Middleware de Autenticación
 * 
 * Verifica tokens JWT y protege rutas.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token no proporcionado');
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const payload = verifyToken(token);
    
    // Agregar usuario al request
    req.user = payload;
    
    next();
  } catch (error) {
    next(new AuthenticationError('Token inválido o expirado'));
  }
}

/**
 * Middleware para verificar que el usuario sea admin
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AuthenticationError('No autenticado'));
  }

  if (req.user.level !== 'admin') {
    return next(new AuthorizationError('Se requieren permisos de administrador'));
  }

  next();
}
