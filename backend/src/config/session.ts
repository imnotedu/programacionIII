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
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    sameSite: 'lax'
  },
  name: 'powerfit.sid'
};

