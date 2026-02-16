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

/**
 * Seed de productos - Ejecuta solo si la base de datos está vacía
 */
export async function seedProductsIfEmpty(): Promise<void> {
  try {
    // Verificar si ya hay productos
    const res = await query('SELECT COUNT(*) as total FROM products');
    const count = parseInt(res.rows[0].total);

    if (count > 0) {
      console.log(`  Base de datos ya tiene ${count} productos`);
      return;
    }

    console.log('📦 Base de datos vacía, insertando productos de prueba...');

    const now = new Date().toISOString();
    const crypto = await import('crypto');

    const products = [
      // PROTEÍNAS
      {
        name: "Optimum Nutrition Gold Standard 100% Whey - Chocolate",
        code: "ON-WH-001",
        price: 54.99,
        description: "La proteína whey más vendida del mundo. 24g de proteína por porción, 5.5g de BCAAs y 4g de glutamina. Sabor Double Rich Chocolate. 2 lbs.",
        category: "Proteínas",
        imageUrl: "/images/products/ON-WH-001.avif",
        stock: 35,
      },
      {
        name: "Dymatize ISO100 Hydrolyzed - Vainilla Gourmet",
        code: "DYM-ISO-002",
        price: 62.99,
        description: "Proteína hidrolizada y aislada de suero de leche. 25g de proteína, 0g de azúcar, digestión ultra rápida. Ideal post-entreno. 1.6 lbs.",
        category: "Proteínas",
        imageUrl: "/images/products/DYM-ISO-002.avif",
        stock: 22,
      },
      {
        name: "MuscleTech Nitro-Tech Whey Gold - Cookies & Cream",
        code: "MT-NTG-003",
        price: 47.99,
        description: "Proteína whey con péptidos y aislado de suero. 24g de proteína y 5.5g de BCAAs por porción. Fórmula premium. 2 lbs.",
        category: "Proteínas",
        imageUrl: "/images/products/MT-NTG-003.avif",
        stock: 18,
      },
      {
        name: "BSN Syntha-6 - Fresa Milkshake",
        code: "BSN-SY6-004",
        price: 42.99,
        description: "Matriz de proteínas ultra-premium con 22g de proteína por porción. Mezcla de 6 fuentes de proteína para absorción sostenida. 2.91 lbs.",
        category: "Proteínas",
        imageUrl: "/images/products/BSN-SY6-004.webp",
        stock: 28,
      },
      // RENDIMIENTO
      {
        name: "Optimum Nutrition Micronized Creatine Monohydrate",
        code: "ON-CRE-005",
        price: 24.99,
        description: "Creatina monohidratada micronizada Creapure. 5g por porción, sin sabor, se mezcla fácilmente. Aumenta fuerza y potencia muscular. 300g.",
        category: "Rendimiento",
        imageUrl: "/images/products/ON-CRE-005.avif",
        stock: 50,
      },
      {
        name: "MuscleTech Cell-Tech Creatine - Fruit Punch",
        code: "MT-CT-006",
        price: 34.99,
        description: "Fórmula avanzada de creatina con carbohidratos de alto índice glucémico. 7g de creatina + sistema de transporte de nutrientes. 1.36 kg.",
        category: "Rendimiento",
        imageUrl: "/images/products/MT-CT-006.avif",
        stock: 15,
      },
      {
        name: "Cellucor C4 Original Pre-Workout - Blue Raspberry",
        code: "CEL-C4-007",
        price: 29.99,
        description: "Fórmula pre-entreno con 150mg de cafeína, CarnoSyn Beta-Alanina, creatina monohidratada y vitamina B12. Energía explosiva. 30 porciones.",
        category: "Rendimiento",
        imageUrl: "/images/products/CEL-C4-007.webp",
        stock: 40,
      },
      // PRE-ENTRENO
      {
        name: "C4 Ultimate Pre-Workout - Sour Batch Candy",
        code: "CEL-C4U-008",
        price: 44.99,
        description: "Pre-entreno de alta potencia con 300mg de cafeína, 6g de citrulina, 3.2g de beta-alanina y Cognizin para enfoque mental. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "/images/products/CEL-C4U-008.jpg",
        stock: 12,
      },
      {
        name: "MuscleTech Shatter Pre-Workout - Rainbow Candy",
        code: "MT-SH-009",
        price: 32.99,
        description: "Pre-entreno con 350mg de cafeína, 3g de beta-alanina y 1.5g de betaína. Energía intensa y pump vascular extremo. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "/images/products/MT-SH-009.png",
        stock: 8,
      },
      {
        name: "Ghost Legend All Out Pre-Workout - Sour Watermelon",
        code: "GHO-LEG-010",
        price: 39.99,
        description: "Pre-entreno premium con dosis completas de citrulina (6g), beta-alanina (3.2g), cafeína (250mg) y nootrópicos. Fórmula transparente. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "/images/products/GHO-LEG-010.avif",
        stock: 25,
      },
      // AMINOÁCIDOS
      {
        name: "Xtend Original BCAA - Mango Madness",
        code: "XT-BCAA-011",
        price: 27.99,
        description: "BCAAs 7g en ratio 2:1:1 con electrolitos y citrulina. Sin azúcar ni calorías. Recuperación muscular intra-entreno. 30 porciones.",
        category: "Aminoácidos",
        imageUrl: "/images/products/XT-BCAA-011.avif",
        stock: 33,
      },
      {
        name: "Optimum Nutrition Essential Amino Energy - Wild Berry",
        code: "ON-AE-012",
        price: 22.99,
        description: "Aminoácidos esenciales con 100mg de cafeína natural. Energía ligera + recuperación. Ideal para cualquier hora del día. 30 porciones.",
        category: "Aminoácidos",
        imageUrl: "/images/products/ON-AE-012.webp",
        stock: 45,
      },
      {
        name: "Optimum Nutrition Glutamine Powder",
        code: "ON-GLU-013",
        price: 19.99,
        description: "L-Glutamina pura en polvo. 5g por porción para recuperación muscular y soporte del sistema inmune. Sin sabor. 300g.",
        category: "Aminoácidos",
        imageUrl: "/images/products/ON-GLU-013.jpg",
        stock: 30,
      },
      // GANADORES
      {
        name: "Optimum Nutrition Serious Mass - Chocolate",
        code: "ON-SM-014",
        price: 64.99,
        description: "Ganador de masa con 1,250 calorías, 50g de proteína y 252g de carbohidratos por porción. Incluye creatina y glutamina. 6 lbs.",
        category: "Ganadores",
        imageUrl: "/images/products/ON-SM-014.avif",
        stock: 10,
      },
      {
        name: "Dymatize Super Mass Gainer - Rich Chocolate",
        code: "DYM-SMG-015",
        price: 52.99,
        description: "Ganador de masa con 1,280 calorías, 52g de proteína y BCAAs. Fórmula con enzimas digestivas para mejor absorción. 6 lbs.",
        category: "Ganadores",
        imageUrl: "/images/products/DYM-SMG-015.jpg",
        stock: 14,
      },
      {
        name: "BSN True Mass 1200 - Strawberry Milkshake",
        code: "BSN-TM-016",
        price: 58.99,
        description: "Ganador ultra-premium con 1,220 calorías, 50g de proteína multi-fuente y grasas saludables de semillas de linaza y MCT. 4.73 kg.",
        category: "Ganadores",
        imageUrl: "/images/products/BSN-TM-016.jpg",
        stock: 7,
      },
      // VITAMINAS
      {
        name: "Optimum Nutrition Opti-Men Multivitamínico",
        code: "ON-OM-017",
        price: 21.99,
        description: "Multivitamínico para hombres activos con 75+ ingredientes. Incluye aminoácidos, antioxidantes, enzimas y minerales. 90 tabletas.",
        category: "Vitaminas",
        imageUrl: "/images/products/ON-OM-017.avif",
        stock: 42,
      },
      {
        name: "NOW Foods Omega-3 Fish Oil 1000mg",
        code: "NOW-OM3-018",
        price: 14.99,
        description: "Aceite de pescado molecularmente destilado con 180mg EPA y 120mg DHA. Soporte cardiovascular y articular. 200 cápsulas.",
        category: "Vitaminas",
        imageUrl: "/images/products/NOW-OM3-018.avif",
        stock: 60,
      },
      {
        name: "Nature Made Vitamin D3 2000 IU",
        code: "NM-VD3-019",
        price: 11.99,
        description: "Vitamina D3 para soporte óseo, muscular e inmunológico. 2000 IU por softgel. Formulación farmacéutica. 220 softgels.",
        category: "Vitaminas",
        imageUrl: "/images/products/NM-VD3-019.avif",
        stock: 55,
      },
      {
        name: "Optimum Nutrition ZMA - Zinc Magnesio",
        code: "ON-ZMA-020",
        price: 18.99,
        description: "Combinación de Zinc, Magnesio y Vitamina B6 para recuperación nocturna, soporte hormonal y calidad de sueño. 90 cápsulas.",
        category: "Vitaminas",
        imageUrl: "/images/products/ON-ZMA-020.avif",
        stock: 38,
      },
    ];

    for (const p of products) {
      const id = `prod-${crypto.randomUUID().slice(0, 8)}`;

      await query(`
        INSERT INTO products (id, name, code, price, description, category, imageUrl, stock, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        id,
        p.name,
        p.code,
        p.price,
        p.description,
        p.category,
        p.imageUrl,
        p.stock,
        now,
        now
      ]);
    }

    console.log(`✅ ${products.length} productos insertados exitosamente con imágenes locales`);
  } catch (error) {
    console.error('❌ Error en seed de productos:', error);
  }
}
