"use strict";
/**
 * Rutas de Carrito
 *
 * Define las rutas para la gestión del carrito de compras.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas las rutas de carrito requieren autenticación
router.use(auth_1.authenticate);
/**
 * GET /api/cart
 * Obtener carrito del usuario
 */
router.get('/', cart_controller_1.getCart);
/**
 * POST /api/cart/items
 * Agregar producto al carrito
 */
router.post('/items', cart_controller_1.addItem);
/**
 * PUT /api/cart/items/:productId
 * Actualizar cantidad de un producto
 */
router.put('/items/:productId', cart_controller_1.updateItem);
/**
 * DELETE /api/cart/items/:productId
 * Eliminar producto del carrito
 */
router.delete('/items/:productId', cart_controller_1.removeItem);
/**
 * DELETE /api/cart
 * Vaciar carrito
 */
router.delete('/', cart_controller_1.clearCart);
/**
 * POST /api/cart/checkout
 * Procesar compra
 */
router.post('/checkout', cart_controller_1.checkout);
exports.default = router;
