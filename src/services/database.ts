/**
 * Database Service
 * 
 * Servicio de base de datos SQLite para gestionar usuarios y autenticación.
 * Incluye inicialización automática con superadmin predefinido.
 */

import Database from 'better-sqlite3';
import { AuthService } from './authService';
import { RegisteredUser } from '@/types/auth';

// Ruta de la base de datos
const DB_PATH = './powerfit.db';

/**
 * Inicializa la base de datos y crea las tablas necesarias
 */
export function initializeDatabase(): Database.Database {
  const db = new Database(DB_PATH);
  
  // Crear tabla de usuarios si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      name TEXT NOT NULL,
      level TEXT NOT NULL CHECK(level IN ('admin', 'usuario')),
      createdAt TEXT NOT NULL
    )
  `);

  // Crear índice para búsquedas rápidas por email
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `);

  console.log('✅ Base de datos inicializada correctamente');
  
  return db;
}

/**
 * Crea el superadmin si no existe
 * Usuario: admin
 * Contraseña: 1234567
 */
export async function createSuperAdmin(db: Database.Database): Promise<void> {
  // Verificar si ya existe el superadmin
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get('admin');
  
  if (existingAdmin) {
    console.log('ℹ️  Superadmin ya existe');
    return;
  }

  // Crear el superadmin
  const passwordHash = await AuthService.hashPassword('1234567');
  
  const superAdmin: RegisteredUser = {
    id: 'superadmin-001',
    email: 'admin',
    passwordHash,
    name: 'Administrador del Sistema',
    level: 'admin',
    createdAt: new Date().toISOString()
  };

  const stmt = db.prepare(`
    INSERT INTO users (id, email, passwordHash, name, level, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    superAdmin.id,
    superAdmin.email,
    superAdmin.passwordHash,
    superAdmin.name,
    superAdmin.level,
    superAdmin.createdAt
  );

  console.log('✅ Superadmin creado exitosamente');
  console.log('   Usuario: admin');
  console.log('   Contraseña: 1234567');
}

/**
 * Obtiene la instancia de la base de datos
 */
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
}

/**
 * Cierra la conexión a la base de datos
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('✅ Base de datos cerrada');
  }
}
