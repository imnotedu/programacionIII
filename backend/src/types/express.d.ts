/**
 * Extensiones de tipos para Express
 * 
 * Este archivo extiende los tipos de Express para incluir
 * propiedades personalizadas como session, flash, etc.
 */

declare global {
  namespace Express {
    interface Request {
      session: any;
      sessionID: string;
      flash(type: string, message: string): void;
      flash(type: string): string[];
      flash(): { [key: string]: string[] };
    }

    interface User {
      id: string;
      email: string;
      name: string;
      isAdmin?: boolean;
    }
  }
}

export {};
