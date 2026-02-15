/**
 * Rutas de Favoritos basado en Sesión
 * 
 * Define las rutas para la gestión de favoritos usando sesiones y cookies.
 * No requiere autenticación.
 */

import { Router } from 'express';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites
} from '../controllers/favorites.controller';

const router = Router();

/**
 * POST /api/favorites/add
 * Agregar producto a favoritos de la sesión
 */
router.post('/add', addToFavorites);

/**
 * DELETE /api/favorites/remove
 * Remover producto de favoritos de la sesión
 */
router.delete('/remove', removeFromFavorites);

/**
 * GET /api/favorites
 * Obtener lista de favoritos
 */
router.get('/', getFavorites);

export default router;
