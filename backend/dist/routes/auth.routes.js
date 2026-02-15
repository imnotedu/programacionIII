"use strict";
/**
 * Rutas de Autenticación
 *
 * Define las rutas para login, registro y perfil de usuario.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/login
 * Login de usuario
 */
router.post('/login', auth_controller_1.login);
/**
 * POST /api/auth/register
 * Registro de nuevo usuario
 */
router.post('/register', auth_controller_1.register);
/**
 * POST /api/auth/logout
 * Logout de usuario
 */
router.post('/logout', auth_controller_1.logout);
/**
 * GET /api/auth/me
 * Obtener perfil del usuario autenticado
 * Requiere autenticación
 */
router.get('/me', auth_1.authenticate, auth_controller_1.getProfile);
exports.default = router;
