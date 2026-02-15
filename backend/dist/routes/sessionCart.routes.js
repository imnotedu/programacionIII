"use strict";
/**
 * Rutas de Carrito basado en Sesión
 *
 * Define las rutas para la gestión del carrito usando sesiones.
 * No requiere autenticación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionCart_controller_1 = require("../controllers/sessionCart.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/cart/add
 * Agregar producto al carrito de la sesión
 */
router.post('/add', sessionCart_controller_1.addToCart);
/**
 * PUT /api/cart/update
 * Actualizar cantidad en la sesión
 */
router.put('/update', sessionCart_controller_1.updateCartItem);
/**
 * DELETE /api/cart/remove
 * Eliminar producto de la sesión
 */
router.delete('/remove', sessionCart_controller_1.removeFromCart);
/**
 * DELETE /api/cart/clear
 * Vaciar carrito de la sesión
 */
router.delete('/clear', sessionCart_controller_1.clearSessionCart);
exports.default = router;
