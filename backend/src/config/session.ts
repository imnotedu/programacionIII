/**
 * Configuración de Sesiones
 * 
 * Configura express-session con opciones seguras.
 */

import session from 'express-session';

export const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'powerfit-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' para HTTPS cross-site
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
  },
  name: 'powerfit.sid',
  proxy: process.env.NODE_ENV === 'production' // Confiar en proxy de Render
};
