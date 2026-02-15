"use strict";
/**
 * Rutas Principales
 *
 * Centraliza todas las rutas de la API.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const sessionCart_routes_1 = __importDefault(require("./sessionCart.routes"));
const favorites_routes_1 = __importDefault(require("./favorites.routes"));
const router = (0, express_1.Router)();
// Rutas de autenticación
router.use('/auth', auth_routes_1.default);
// Rutas de productos
router.use('/products', product_routes_1.default);
// Rutas de carrito (base de datos - requiere autenticación)
router.use('/cart-db', cart_routes_1.default);
// Rutas de carrito basado en sesión (no requiere autenticación)
router.use('/cart', sessionCart_routes_1.default);
// Rutas de favoritos basado en sesión
router.use('/favorites', favorites_routes_1.default);
// Ruta de health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
