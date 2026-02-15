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

  // Cookie parser
  app.use(cookieParser());

  // Archivos estáticos con configuración de caché optimizada
  // Requisitos: 15.1, 15.2, 15.3
  app.use(express.static(path.join(__dirname, '../public'), {
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
