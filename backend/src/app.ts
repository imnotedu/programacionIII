/**
 * Configuración de la Aplicación Express
 * 
 * Configura middleware, rutas y manejo de errores.
 */

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import compression from 'compression';
import methodOverride from 'method-override';
import { config } from './config/env';
import { sessionConfig } from './config/session';
import routes from './routes';
import viewRoutes from './routes/views';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import path from 'path';

/**
 * Crea y configura la aplicación Express
 */
export function createApp(): Application {
  const app = express();

  // Motor de plantillas EJS
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  // express-ejs-layouts
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);

  // Habilitar compresión gzip para todos los recursos
  // Requisito: 15.5
  app.use(compression({
    // Comprimir todas las respuestas
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    // Nivel de compresión (0-9, 6 es el default)
    level: 6
  }));

  // Middleware de parsing - limit aumentado para soportar imágenes en base64
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Method override para soportar DELETE/PUT desde formularios HTML
  // Lee _method del body del form (hidden input) o del query string
  app.use(methodOverride(function (req) {
    // Primero intentar desde query string (funciona con multipart/form-data)
    if (req.query && '_method' in req.query) {
      return req.query._method as string;
    }
    // Luego intentar desde body (funciona con application/x-www-form-urlencoded)
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      const method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  // Cookie parser
  app.use(cookieParser());

  // Archivos estáticos con configuración de caché optimizada
  // Requisitos: 15.1, 15.2, 15.3
  const publicPath = path.join(__dirname, '../public');
  console.log('📁 Sirviendo archivos estáticos desde:', publicPath);
  console.log('📁 __dirname:', __dirname);
  
  app.use(express.static(publicPath, {
    maxAge: config.nodeEnv === 'production' ? '1y' : '1d', // 1 año en producción, 1 día en desarrollo
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Configurar caché específico por tipo de archivo
      if (filePath.endsWith('.css')) {
        // CSS: 1 año en producción, 1 día en desarrollo
        // Requisito: 15.1
        res.setHeader('Cache-Control', config.nodeEnv === 'production'
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=86400');
      } else if (filePath.endsWith('.js')) {
        // JavaScript: 1 año en producción, 1 día en desarrollo
        // Requisito: 15.3
        res.setHeader('Cache-Control', config.nodeEnv === 'production'
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=86400');
      } else if (filePath.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
        // Imágenes: 1 año en producción, 7 días en desarrollo
        // Requisito: 15.2
        res.setHeader('Cache-Control', config.nodeEnv === 'production'
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=604800');
      }
    }
  }));

  // Sesiones
  app.use(session(sessionConfig));

  // Flash messages
  app.use(flash());

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

  app.use(cors());

  // Logging de requests en desarrollo
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Rutas de vistas (montar antes de las rutas de API)
  // Requisitos: 5.1, 5.8
  app.use('/', viewRoutes);

  // Rutas de la API
  app.use('/api', routes);

  // Test route for EJS configuration
  app.get('/test-ejs', (req, res) => {
    res.render('pages/test', {
      title: 'EJS Configuration Test - PowerFit'
    });
  });

  // Test route to check if CSS file exists
  app.get('/test-css-exists', (req, res) => {
    const fs = require('fs');
    const cssPath = path.join(__dirname, '../public/css/styles.css');
    const exists = fs.existsSync(cssPath);
    const stats = exists ? fs.statSync(cssPath) : null;
    
    res.json({
      cssPath,
      exists,
      size: stats ? stats.size : 0,
      __dirname,
      publicPath: path.join(__dirname, '../public')
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
  app.use(notFoundHandler);

  // Manejo global de errores
  app.use(errorHandler);

  return app;
}
