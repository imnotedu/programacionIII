/**
 * Rutas de Autenticación
 * 
 * Define las rutas para login, registro y perfil de usuario.
 */

import { Router } from 'express';
import { login, register, getProfile, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post('/login', login);

/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
router.post('/register', register);

/**
 * POST /api/auth/logout
 * Logout de usuario
 */
router.post('/logout', logout);

/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 * Requiere autenticación
 */
router.get('/me', authenticate, getProfile);

export default router;
