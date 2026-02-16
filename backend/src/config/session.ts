/**
 * Configuración de Sesiones
 * 
 * Configura express-session con opciones seguras.
 */

import session from 'express-session';

const isProduction = process.env.NODE_ENV === 'production';

export const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'powerfit-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // HTTPS en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: isProduction ? 'lax' : 'lax', // lax funciona mejor en Render
  },
  name: 'powerfit.sid',
  proxy: isProduction // Confiar en proxy de Render
};
