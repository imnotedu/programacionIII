/**
 * Configuración de Base de Datos (PostgreSQL)
 * 
 * Gestiona la conexión y configuración de PostgreSQL para el backend.
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { config } from './env';
import { hashPassword } from '../utils/auth';

// Configuración del Pool de conexiones
const poolConfig = config.databaseUrl
  ? { connectionString: config.databaseUrl, ssl: { rejectUnauthorized: false } }
  : {
    user: config.dbUser,
    host: config.dbHost,
    database: config.dbName,
    password: config.dbPassword,
    port: config.dbPort,
  };

const pool = new Pool(poolConfig);

/**
 * Ejecuta una consulta a la base de datos
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;

  if (config.nodeEnv === 'development') {
    // console.log('ejecutada consulta', { text, duration, rows: res.rowCount });
  }

  return res;
}

/**
 * Obtiene un cliente del pool para transacciones
 */
export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

/**
 * Inicializa las tablas de la base de datos
 */
export async function initializeTables(): Promise<void> {
  try {
    // Tabla de usuarios
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL CHECK(level IN ('admin', 'usuario')),
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL
      )
    `);

    // Índices para usuarios
    await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_level ON users(level)`);

    // Tabla de productos
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255) NOT NULL,
        imageUrl TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL
      )
    `);

    // Índices para productos
    await query(`CREATE INDEX IF NOT EXISTS idx_products_code ON products(code)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`);

    // Tabla de carritos
    await query(`
      CREATE TABLE IF NOT EXISTS carts (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Tabla de items del carrito
    await query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id VARCHAR(255) PRIMARY KEY,
        cartId VARCHAR(255) NOT NULL,
        productId VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        createdAt TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP NOT NULL,
        FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(cartId, productId)
      )
    `);

    // Índices para carritos
    await query(`CREATE INDEX IF NOT EXISTS idx_carts_userId ON carts(userId)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cart_items_cartId ON cart_items(cartId)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cart_items_productId ON cart_items(productId)`);

    console.log('✅ Tablas de base de datos inicializadas (PostgreSQL)');
  } catch (error) {
    console.error('❌ Error inicializando tablas:', error);
    throw error;
  }
}

/**
 * Crea el superadmin si no existe
 */
export async function createSuperAdmin(): Promise<void> {
  try {
    // Verificar si ya existe
    const res = await query('SELECT id FROM users WHERE email = $1', ['admin@powerfit.com']);

    if (res.rows.length > 0) {
      console.log('  Superadmin ya existe');
      return;
    }

    // Crear superadmin
    const passwordHash = await hashPassword('1234567');
    const now = new Date().toISOString();

    await query(`
      INSERT INTO users (id, email, passwordHash, name, level, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'superadmin-001',
      'admin@powerfit.com',
      passwordHash,
      'Administrador del Sistema',
      'admin',
      now,
      now
    ]);

    console.log('✅ Superadmin creado exitosamente');
    console.log('   Email: admin@powerfit.com');
    console.log('   Contraseña: 1234567');
  } catch (error) {
    console.error('❌ Error creando superadmin:', error);
  }
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDatabase(): Promise<void> {
  await pool.end();
  console.log('✅ Conexión a base de datos cerrada');
}
