/**
 * Rutas de Carrito basado en Sesión
 * 
 * Define las rutas para la gestión del carrito usando sesiones.
 * No requiere autenticación.
 */

import { Router } from 'express';
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  clearSessionCart
} from '../controllers/sessionCart.controller';

const router = Router();

/**
 * POST /api/cart/add
 * Agregar producto al carrito de la sesión
 */
router.post('/add', addToCart);

/**
 * PUT /api/cart/update
 * Actualizar cantidad en la sesión
 */
router.put('/update', updateCartItem);

/**
 * DELETE /api/cart/remove
 * Eliminar producto de la sesión
 */
router.delete('/remove', removeFromCart);

/**
 * DELETE /api/cart/clear
 * Vaciar carrito de la sesión
 */
router.delete('/clear', clearSessionCart);

export default router;
