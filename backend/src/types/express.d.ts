/**
 * Extensiones de tipos para Express
 * 
 * Este archivo extiende los tipos de Express para incluir
 * propiedades personalizadas como session, flash, etc.
 */

import 'express-session';

declare global {
  namespace Express {
    interface Request {
      session: import('express-session').Session & {
        user?: {
          id: string;
          email: string;
          name: string;
          isAdmin?: boolean;
        };
        cart?: Array<{
          productId: string;
          quantity: number;
        }>;
        favorites?: string[];
        visitCount?: number;
      };
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
