"use strict";
/**
 * Utilidades de Autenticación
 *
 * Funciones para hashear contraseñas, generar tokens JWT y validarlos.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Hashea una contraseña usando bcrypt
 */
async function hashPassword(password) {
    const saltRounds = 10;
    return bcryptjs_1.default.hash(password, saltRounds);
}
/**
 * Compara una contraseña con su hash
 */
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
/**
 * Genera un token JWT
 */
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.config.jwtSecret, {
        expiresIn: env_1.config.jwtExpiresIn
    });
}
/**
 * Verifica y decodifica un token JWT
 */
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.config.jwtSecret);
    }
    catch (error) {
        throw new Error('Token inválido o expirado');
    }
}
