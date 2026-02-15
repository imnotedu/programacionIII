"use strict";
/**
 * Configuración de la Aplicación Express
 *
 * Configura middleware, rutas y manejo de errores.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const express_session_1 = __importDefault(require("express-session"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const compression_1 = __importDefault(require("compression"));
const env_1 = require("./config/env");
const session_1 = require("./config/session");
const routes_1 = __importDefault(require("./routes"));
const views_1 = __importDefault(require("./routes/views"));
const errorHandler_1 = require("./middleware/errorHandler");
const path_1 = __importDefault(require("path"));
/**
 * Crea y configura la aplicación Express
 */
function createApp() {
    const app = (0, express_1.default)();
    // Motor de plantillas EJS
    app.set('view engine', 'ejs');
    app.set('views', path_1.default.join(__dirname, '../views'));
    // express-ejs-layouts
    app.use(express_ejs_layouts_1.default);
    app.set('layout', 'layouts/main');
    app.set('layout extractScripts', true);
    app.set('layout extractStyles', true);
    // Habilitar compresión gzip para todos los recursos
    // Requisito: 15.5
    app.use((0, compression_1.default)({
        // Comprimir todas las respuestas
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression_1.default.filter(req, res);
        },
        // Nivel de compresión (0-9, 6 es el default)
        level: 6
    }));
    // Middleware de parsing - limit aumentado para soportar imágenes en base64
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Cookie parser
    app.use((0, cookie_parser_1.default)());
    // Archivos estáticos con configuración de caché optimizada
    // Requisitos: 15.1, 15.2, 15.3
    app.use(express_1.default.static(path_1.default.join(__dirname, '../public'), {
        maxAge: env_1.config.nodeEnv === 'production' ? '1y' : '1d', // 1 año en producción, 1 día en desarrollo
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
            // Configurar caché específico por tipo de archivo
            if (filePath.endsWith('.css')) {
                // CSS: 1 año en producción, 1 día en desarrollo
                // Requisito: 15.1
                res.setHeader('Cache-Control', env_1.config.nodeEnv === 'production'
                    ? 'public, max-age=31536000, immutable'
                    : 'public, max-age=86400');
            }
            else if (filePath.endsWith('.js')) {
                // JavaScript: 1 año en producción, 1 día en desarrollo
                // Requisito: 15.3
                res.setHeader('Cache-Control', env_1.config.nodeEnv === 'production'
                    ? 'public, max-age=31536000, immutable'
                    : 'public, max-age=86400');
            }
            else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
                // Imágenes: 1 año en producción, 7 días en desarrollo
                // Requisito: 15.2
                res.setHeader('Cache-Control', env_1.config.nodeEnv === 'production'
                    ? 'public, max-age=31536000, immutable'
                    : 'public, max-age=604800');
            }
        }
    }));
    // Sesiones
    app.use((0, express_session_1.default)(session_1.sessionConfig));
    // Flash messages
    app.use((0, connect_flash_1.default)());
    // Variables locales globales
    app.use((req, res, next) => {
        res.locals.user = req.session.user || null;
        res.locals.isAuthenticated = !!req.session.user;
        // Calculate cart count (total items, not unique products)
        const cartCount = req.session.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        res.locals.cartCount = cartCount;
        res.locals.favorites = req.session.favorites || [];
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        res.locals.currentPath = req.path;
        next();
    });
    // CORS - permite múltiples orígenes
    //const allowedOrigins = config.corsOrigin.split(',').map(origin => origin.trim());
    app.use((0, cors_1.default)());
    // Logging de requests en desarrollo
    if (env_1.config.nodeEnv === 'development') {
        app.use((req, res, next) => {
            console.log(`${req.method} ${req.path}`);
            next();
        });
    }
    // Rutas de vistas (montar antes de las rutas de API)
    // Requisitos: 5.1, 5.8
    app.use('/', views_1.default);
    // Rutas de la API
    app.use('/api', routes_1.default);
    // Test route for EJS configuration
    app.get('/test-ejs', (req, res) => {
        res.render('pages/test', {
            title: 'EJS Configuration Test - PowerFit'
        });
    });
    // Simple test route without partials
    app.get('/test-simple', (req, res) => {
        res.render('pages/test', {
            title: 'EJS Configuration Test - PowerFit',
            layout: 'layouts/test-simple'
        });
    });
    // Test session functionality
    app.get('/test-session', (req, res) => {
        // Increment visit counter
        if (!req.session.visitCount) {
            req.session.visitCount = 0;
        }
        req.session.visitCount++;
        res.json({
            success: true,
            message: 'Session is working!',
            visitCount: req.session.visitCount,
            sessionId: req.sessionID
        });
    });
    // Handler 404 para rutas no encontradas
    // Requisito: 5.8
    app.use(errorHandler_1.notFoundHandler);
    // Manejo global de errores
    app.use(errorHandler_1.errorHandler);
    return app;
}
