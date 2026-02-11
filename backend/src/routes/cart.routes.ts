/**
 * Rutas de Carrito
 * 
 * Define las rutas para la gestión del carrito de compras.
 */

import { Router } from 'express';
import {
    getCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    checkout
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas de carrito requieren autenticación
router.use(authenticate);

/**
 * GET /api/cart
 * Obtener carrito del usuario
 */
router.get('/', getCart);

/**
 * POST /api/cart/items
 * Agregar producto al carrito
 */
router.post('/items', addItem);

/**
 * PUT /api/cart/items/:productId
 * Actualizar cantidad de un producto
 */
router.put('/items/:productId', updateItem);

/**
 * DELETE /api/cart/items/:productId
 * Eliminar producto del carrito
 */
router.delete('/items/:productId', removeItem);

/**
 * DELETE /api/cart
 * Vaciar carrito
 */
router.delete('/', clearCart);

/**
 * POST /api/cart/checkout
 * Procesar compra
 */
router.post('/checkout', checkout);

export default router;
