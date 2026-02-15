/**
 * Configuración de Variables de Entorno
 * 
 * Centraliza y valida todas las variables de entorno del backend.
 */

import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
// Detecta automáticamente si estamos en la raíz o en backend/
const envPath = process.cwd().endsWith('backend') 
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), 'backend', '.env');
dotenv.config({ path: envPath });

/**
 * Configuración del servidor
 */
export const config = {
  // Puerto del servidor
  port: parseInt(process.env.PORT || '3000', 10),

  // Entorno (development, production)
  nodeEnv: process.env.NODE_ENV || 'development',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'powerfit-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // CORS - permite localhost:8080 y localhost:8081 por defecto
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',

  // Base de datos (PostgreSQL)
  // En producción (Render) se usa DATABASE_URL
  databaseUrl: process.env.DATABASE_URL,

  // En desarrollo local se pueden usar variables individuales
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: parseInt(process.env.DB_PORT || '5432', 10),
  dbUser: process.env.DB_USER || 'postgres',
  dbPassword: process.env.DB_PASSWORD || 'postgres',
  dbName: process.env.DB_NAME || 'powerfit',
} as const;

/**
 * Valida que las variables de entorno críticas estén configuradas
 */
export function validateEnv(): void {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0 && config.nodeEnv === 'production') {
    console.warn(`⚠️  Variables de entorno faltantes: ${missing.join(', ')}`);
    console.warn('⚠️  Usando valores por defecto (NO recomendado en producción)');
  }
}
