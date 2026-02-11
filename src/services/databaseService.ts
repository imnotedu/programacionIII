/**
 * Database Service
 * 
 * Servicio para gestionar operaciones CRUD de usuarios en SQLite.
 * Reemplaza al StorageService basado en localStorage.
 */

import { getDatabase } from './database';
import { RegisteredUser, User, AuthToken } from '@/types/auth';

export class DatabaseService {
  /**
   * Obtiene todos los usuarios de la base de datos
   */
  static getUsers(): RegisteredUser[] {
    try {
      const db = getDatabase();
      const users = db.prepare('SELECT * FROM users').all() as RegisteredUser[];
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }

  /**
   * Busca un usuario por email
   */
  static findUserByEmail(email: string): RegisteredUser | null {
    try {
      const db = getDatabase();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as RegisteredUser | undefined;
      return user || null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      return null;
    }
  }

  /**
   * Busca un usuario por ID
   */
  static findUserById(id: string): RegisteredUser | null {
    try {
      const db = getDatabase();
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as RegisteredUser | undefined;
      return user || null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return null;
    }
  }

  /**
   * Agrega un nuevo usuario a la base de datos
   */
  static addUser(user: RegisteredUser): boolean {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO users (id, email, passwordHash, name, level, createdAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        user.id,
        user.email,
        user.passwordHash,
        user.name,
        user.level,
        user.createdAt
      );
      
      return true;
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      return false;
    }
  }

  /**
   * Actualiza un usuario existente
   */
  static updateUser(id: string, updates: Partial<RegisteredUser>): boolean {
    try {
      const db = getDatabase();
      
      // Construir la query dinámicamente según los campos a actualizar
      const fields = Object.keys(updates).filter(key => key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof RegisteredUser]);
      
      const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`);
      stmt.run(...values, id);
      
      return true;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  }

  /**
   * Elimina un usuario de la base de datos
   */
  static deleteUser(id: string): boolean {
    try {
      const db = getDatabase();
      const stmt = db.prepare('DELETE FROM users WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return false;
    }
  }

  // ==================== Gestión de Sesión (localStorage) ====================
  // El token y usuario actual se mantienen en localStorage para la sesión del navegador
  
  /**
   * Guarda el token de autenticación en localStorage
   */
  static saveToken(token: AuthToken): void {
    try {
      localStorage.setItem('authToken', JSON.stringify(token));
    } catch (error) {
      console.error('Error al guardar token:', error);
    }
  }

  /**
   * Obtiene el token de autenticación desde localStorage
   */
  static getToken(): AuthToken | null {
    try {
      const tokenStr = localStorage.getItem('authToken');
      if (!tokenStr) return null;
      return JSON.parse(tokenStr) as AuthToken;
    } catch (error) {
      console.error('Error al leer token:', error);
      return null;
    }
  }

  /**
   * Elimina el token de autenticación
   */
  static clearToken(): void {
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error al eliminar token:', error);
    }
  }

  /**
   * Guarda el usuario actual en localStorage
   */
  static saveCurrentUser(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error al guardar usuario actual:', error);
    }
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  static getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (!userStr) return null;
      return JSON.parse(userStr) as User;
    } catch (error) {
      console.error('Error al leer usuario actual:', error);
      return null;
    }
  }

  /**
   * Elimina el usuario actual de localStorage
   */
  static clearCurrentUser(): void {
    try {
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error al eliminar usuario actual:', error);
    }
  }

  /**
   * Limpia toda la sesión (token y usuario actual)
   */
  static clearAll(): void {
    this.clearToken();
    this.clearCurrentUser();
  }

  /**
   * Limpia todo incluyendo la sesión
   */
  static clearEverything(): void {
    this.clearAll();
  }
}
