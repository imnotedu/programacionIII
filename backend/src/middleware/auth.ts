/**
 * Middleware de Autenticación
 * 
 * Verifica sesiones y protege rutas para la aplicación EJS.
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/auth';
import { AuthenticationError, AuthorizationError } from '../utils/errors';

// Extender Request para incluir user (para compatibilidad con JWT)
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware para verificar autenticación JWT (para API REST)
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
 * Middleware para verificar que el usuario sea admin (JWT)
 */
export function requireAdminJWT(
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

// ============================================================================
// Middleware de Autenticación basado en Sesiones (para vistas EJS)
// ============================================================================

/**
 * Middleware para verificar sesión activa
 * Redirige a /login si el usuario no está autenticado
 * 
 * Requisitos: 14.1, 14.3, 14.5
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user) {
    return next();
  }
  req.flash('error', 'Debes iniciar sesión para acceder a esta página');
  res.redirect('/login');
}

/**
 * Middleware para verificar rol de administrador
 * Redirige a /access-denied si el usuario no es admin
 * 
 * Requisitos: 14.2, 14.4, 14.5
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user?.isAdmin) {
    return next();
  }
  req.flash('error', 'No tienes permisos para acceder a esta página');
  res.redirect('/access-denied');
}

/**
 * Middleware para redirigir si ya está autenticado
 * Útil para páginas de login/register
 * 
 * Requisitos: 14.6
 */
export function redirectIfAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
}
