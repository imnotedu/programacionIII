"use strict";
/**
 * Rutas de Favoritos basado en Sesión
 *
 * Define las rutas para la gestión de favoritos usando sesiones y cookies.
 * No requiere autenticación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favorites_controller_1 = require("../controllers/favorites.controller");
const router = (0, express_1.Router)();
/**
 * POST /api/favorites/add
 * Agregar producto a favoritos de la sesión
 */
router.post('/add', favorites_controller_1.addToFavorites);
/**
 * DELETE /api/favorites/remove
 * Remover producto de favoritos de la sesión
 */
router.delete('/remove', favorites_controller_1.removeFromFavorites);
/**
 * GET /api/favorites
 * Obtener lista de favoritos
 */
router.get('/', favorites_controller_1.getFavorites);
exports.default = router;
