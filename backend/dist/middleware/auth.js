"use strict";
/**
 * Middleware de Autenticación
 *
 * Verifica sesiones y protege rutas para la aplicación EJS.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAdminJWT = requireAdminJWT;
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.redirectIfAuth = redirectIfAuth;
const auth_1 = require("../utils/auth");
const errors_1 = require("../utils/errors");
/**
 * Middleware para verificar autenticación JWT (para API REST)
 */
function authenticate(req, res, next) {
    try {
        // Obtener token del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.AuthenticationError('Token no proporcionado');
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        // Verificar token
        const payload = (0, auth_1.verifyToken)(token);
        // Agregar usuario al request
        req.user = payload;
        next();
    }
    catch (error) {
        next(new errors_1.AuthenticationError('Token inválido o expirado'));
    }
}
/**
 * Middleware para verificar que el usuario sea admin (JWT)
 */
function requireAdminJWT(req, res, next) {
    if (!req.user) {
        return next(new errors_1.AuthenticationError('No autenticado'));
    }
    if (req.user.level !== 'admin') {
        return next(new errors_1.AuthorizationError('Se requieren permisos de administrador'));
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
function requireAuth(req, res, next) {
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
function requireAdmin(req, res, next) {
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
function redirectIfAuth(req, res, next) {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
}
