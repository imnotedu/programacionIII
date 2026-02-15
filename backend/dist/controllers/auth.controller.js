"use strict";
/**
 * Controlador de Autenticación
 *
 * Maneja las operaciones de login y registro de usuarios.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getProfile = getProfile;
exports.logout = logout;
const database_1 = require("../config/database");
const auth_1 = require("../utils/auth");
const auth_schemas_1 = require("../schemas/auth.schemas");
const errors_1 = require("../utils/errors");
/**
 * Login de usuario
 * POST /api/auth/login
 */
async function login(req, res, next) {
    try {
        // Validar datos
        const { email, password } = auth_schemas_1.loginSchema.parse(req.body);
        // Buscar usuario en la base de datos
        const result = await (0, database_1.query)(`
      SELECT id, email, passwordHash, name, level 
      FROM users 
      WHERE email = $1
    `, [email]);
        // En Postgres, los resultados están en rows
        const user = result.rows[0];
        if (!user) {
            req.flash('error', 'Credenciales incorrectas');
            return res.redirect('/login');
        }
        // Verificar contraseña
        const dbPassword = user.passwordhash || user.passwordHash;
        if (!dbPassword) {
            console.error("Error crítico: No se encuentra hash de contraseña", user);
            req.flash('error', 'Error interno de autenticación');
            return res.redirect('/login');
        }
        const isValidPassword = await (0, auth_1.comparePassword)(password, dbPassword);
        if (!isValidPassword) {
            req.flash('error', 'Credenciales incorrectas');
            return res.redirect('/login');
        }
        // Almacenar usuario en sesión
        req.session.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.level === 'admin'
        };
        // Establecer mensaje de éxito
        req.flash('success', `¡Bienvenido, ${user.name}!`);
        // Redirigir a la página de inicio
        res.redirect('/');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Registro de usuario
 * POST /api/auth/register
 */
async function register(req, res, next) {
    try {
        // Validar datos
        const { name, email, password } = auth_schemas_1.registerSchema.parse(req.body);
        // Verificar si el email ya existe
        const existingResult = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (existingResult.rows.length > 0) {
            req.flash('error', 'Este correo electrónico ya está registrado');
            return res.redirect('/register');
        }
        // Hashear contraseña
        const passwordHash = await (0, auth_1.hashPassword)(password);
        // Crear usuario
        const userId = `user-${Date.now()}`;
        const now = new Date().toISOString();
        await (0, database_1.query)(`
      INSERT INTO users (id, email, passwordHash, name, level, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, email, passwordHash, name, 'usuario', now, now]);
        // Almacenar usuario en sesión
        req.session.user = {
            id: userId,
            email,
            name,
            isAdmin: false
        };
        // Establecer mensaje de éxito
        req.flash('success', '¡Cuenta creada exitosamente! Bienvenido a PowerFit');
        // Redirigir a la página de inicio
        res.redirect('/');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/me
 */
async function getProfile(req, res, next) {
    try {
        if (!req.user) {
            throw new errors_1.AuthenticationError('No autenticado');
        }
        const result = await (0, database_1.query)(`
      SELECT id, email, name, level, createdAt 
      FROM users 
      WHERE id = $1
    `, [req.user.userId]);
        const user = result.rows[0];
        if (!user) {
            throw new errors_1.AuthenticationError('Usuario no encontrado');
        }
        // Normalizar nombres de propiedades por si Postgres las devuelve en minúsculas
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    level: user.level,
                    createdAt: user.createdat || user.createdAt
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Logout de usuario
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
    try {
        // Destruir la sesión
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir sesión:', err);
                req.flash('error', 'Error al cerrar sesión');
                return res.redirect('/');
            }
            // Limpiar la cookie de sesión
            res.clearCookie('powerfit.sid');
            // Redirigir a la página de inicio
            res.redirect('/');
        });
    }
    catch (error) {
        next(error);
    }
}
