"use strict";
/**
 * Clases de Error Personalizadas
 *
 * Define errores específicos de la aplicación para mejor manejo.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
/**
 * Error base de la aplicación
 */
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
/**
 * Error de validación (400)
 */
class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
/**
 * Error de autenticación (401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'No autenticado') {
        super(401, message);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * Error de autorización (403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'No autorizado') {
        super(403, message);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * Error de recurso no encontrado (404)
 */
class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Error de conflicto (409)
 */
class ConflictError extends AppError {
    constructor(message) {
        super(409, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
