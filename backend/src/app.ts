/**
 * Configuración de la Aplicación Express
 * 
 * Configura middleware, rutas y manejo de errores.
 */

import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import path from 'path';

/**
 * Crea y configura la aplicación Express
 */
export function createApp(): Application {
  const app = express();

  // Middleware de parsing - limit aumentado para soportar imágenes en base64
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS - permite múltiples orígenes
  const allowedOrigins = config.corsOrigin.split(',').map(origin => origin.trim());

  app.use(cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps o curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true
  }));

  // Logging de requests en desarrollo
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Rutas de la API
  app.use('/api', routes);

  // Servir frontend compilado (para producción)
  // Como estamos en backend/src, subimos 2 niveles para llegar al root y buscar 'dist'
  const distPath = path.join(process.cwd(), 'dist');

  if (config.nodeEnv === 'production' || process.env.SERVE_STATIC === 'true') {
    app.use(express.static(distPath));

    // Cualquier ruta que no sea API, devuelve el index.html (para React Router)
    app.get('*', (req, res) => {
      // Si solicita API y no existe, ya lo manejó el 404 handler o routes, 
      // pero si pasó por aquí es una ruta de frontend
      if (req.path.startsWith('/api')) {
        return notFoundHandler(req, res, () => { });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Ruta raíz explicativa para desarrollo (cuando no se sirven estáticos)
    app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'PowerFit API Running',
        version: '1.0.0',
        environment: config.nodeEnv,
        endpoints: {
          docs: 'See frontend for usage'
        }
      });
    });
  }

  // Manejo de rutas no encontradas (solo si no es estático o api)
  app.use(notFoundHandler);

  // Manejo global de errores
  app.use(errorHandler);

  return app;
}
