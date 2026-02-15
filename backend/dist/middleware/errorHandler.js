"use strict";
/**
 * Middleware de Manejo de Errores
 *
 * Captura y procesa todos los errores de la aplicación.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const errors_1 = require("../utils/errors");
const zod_1 = require("zod");
/**
 * Middleware global de manejo de errores
 */
function errorHandler(err, req, res, next) {
    // Log del error (solo mensaje y stack)
    console.error('❌ Error:', err.message);
    if (err.stack) {
        console.error(err.stack);
    }
    // Determinar si es una petición AJAX
    const isAjax = req.xhr || req.headers.accept?.includes('application/json');
    // Error de validación de Zod
    if (err instanceof zod_1.ZodError) {
        if (isAjax) {
            res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: err.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message
                }))
            });
        }
        else {
            // Renderizar página de error para peticiones de página
            res.status(400).render('pages/error', {
                title: 'Error de Validación - PowerFit',
                message: 'Error de validación en los datos enviados',
                statusCode: 400,
                errors: err.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message
                })),
                stack: process.env.NODE_ENV === 'development' ? err.stack : null
            });
        }
        return;
    }
    // Error de aplicación personalizado
    if (err instanceof errors_1.AppError) {
        if (isAjax) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }
        else {
            // Renderizar página de error para peticiones de página
            res.status(err.statusCode).render('pages/error', {
                title: 'Error - PowerFit',
                message: err.message,
                statusCode: err.statusCode,
                stack: process.env.NODE_ENV === 'development' ? err.stack : null
            });
        }
        return;
    }
    // Error desconocido
    const statusCode = 500;
    if (isAjax) {
        const errorResponse = {
            success: false,
            message: 'Error interno del servidor'
        };
        // Incluir stack trace solo en desarrollo
        if (process.env.NODE_ENV === 'development' && err.stack) {
            errorResponse.stack = err.stack;
        }
        res.status(statusCode).json(errorResponse);
    }
    else {
        // Renderizar página de error para peticiones de página
        res.status(statusCode).render('pages/error', {
            title: 'Error - PowerFit',
            message: 'Ha ocurrido un error inesperado',
            statusCode,
            // Incluir stack trace solo en desarrollo
            stack: process.env.NODE_ENV === 'development' ? err.stack : null
        });
    }
}
/**
 * Middleware para rutas no encontradas
 */
function notFoundHandler(req, res, next) {
    // Determinar si es una petición AJAX
    const isAjax = req.xhr || req.headers.accept?.includes('application/json');
    if (isAjax) {
        res.status(404).json({
            success: false,
            message: `Ruta no encontrada: ${req.method} ${req.path}`
        });
    }
    else {
        // Renderizar página 404 para peticiones de página
        res.status(404).render('pages/not-found', {
            title: 'Página No Encontrada - PowerFit',
            path: req.path
        });
    }
}
