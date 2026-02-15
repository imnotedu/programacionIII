/**
 * Extensiones de tipos para Express
 * 
 * Agrega tipos para connect-flash y otras extensiones.
 */

import 'express';

declare global {
  namespace Express {
    interface Request {
      flash(type: string, message?: string): string[] | void;
    }
  }
}
