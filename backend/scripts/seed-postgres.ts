/**
 * Seeder de Productos - PowerFit Store (PostgreSQL)
 * 
 * Inserta 20 suplementos reales con imágenes de internet.
 * Ejecutar: node --import tsx scripts/seed-postgres.ts
 */

import { Pool } from 'pg';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Configuración de conexión
const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'powerfit',
        password: process.env.DB_PASSWORD || 'postgres',
        port: parseInt(process.env.DB_PORT || '5432', 10),
    };

const pool = new Pool(poolConfig);

const now = new Date().toISOString();

const products = [
    // ═══════════════════════ PROTEÍNAS ═══════════════════════
    {
        name: "Optimum Nutrition Gold Standard 100% Whey - Chocolate",
        code: "ON-WH-001",
        price: 54.99,
        description: "La proteína whey más vendida del mundo. 24g de proteína por porción, 5.5g de BCAAs y 4g de glutamina. Sabor Double Rich Chocolate. 2 lbs.",
        category: "Proteínas",
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
        stock: 35,
    },
    {
        name: "Dymatize ISO100 Hydrolyzed - Vainilla Gourmet",
        code: "DYM-ISO-002",
        price: 62.99,
        description: "Proteína hidrolizada y aislada de suero de leche. 25g de proteína, 0g de azúcar, digestión ultra rápida. Ideal post-entreno. 1.6 lbs.",
        category: "Proteínas",
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop",
        stock: 22,
    },
    {
        name: "MuscleTech Nitro-Tech Whey Gold - Cookies & Cream",
        code: "MT-NTG-003",
        price: 47.99,
        description: "Proteína whey con péptidos y aislado de suero. 24g de proteína y 5.5g de BCAAs por porción. Fórmula premium. 2 lbs.",
        category: "Proteínas",
        imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop",
        stock: 18,
    },
    {
        name: "BSN Syntha-6 - Fresa Milkshake",
        code: "BSN-SY6-004",
        price: 42.99,
        description: "Matriz de proteínas ultra-premium con 22g de proteína por porción. Mezcla de 6 fuentes de proteína para absorción sostenida. 2.91 lbs.",
        category: "Proteínas",
        imageUrl: "https://images.unsplash.com/photo-1622484211850-cc1f8f6e3f6e?w=400&h=400&fit=crop",
        stock: 28,
    },

    // ═══════════════════════ CREATINA & RENDIMIENTO ═══════════════════════
    {
        name: "Optimum Nutrition Micronized Creatine Monohydrate",
        code: "ON-CRE-005",
        price: 24.99,
        description: "Creatina monohidratada micronizada Creapure. 5g por porción, sin sabor, se mezcla fácilmente. Aumenta fuerza y potencia muscular. 300g.",
        category: "Rendimiento",
        imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop",
        stock: 50,
    },
    {
        name: "MuscleTech Cell-Tech Creatine - Fruit Punch",
        code: "MT-CT-006",
        price: 34.99,
        description: "Fórmula avanzada de creatina con carbohidratos de alto índice glucémico. 7g de creatina + sistema de transporte de nutrientes. 1.36 kg.",
        category: "Rendimiento",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        stock: 15,
    },
    {
        name: "Cellucor C4 Original Pre-Workout - Blue Raspberry",
        code: "CEL-C4-007",
        price: 29.99,
        description: "Fórmula pre-entreno con 150mg de cafeína, CarnoSyn Beta-Alanina, creatina monohidratada y vitamina B12. Energía explosiva. 30 porciones.",
        category: "Rendimiento",
        imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=400&fit=crop",
        stock: 40,
    },

    // ═══════════════════════ PRE-ENTRENO ═══════════════════════
    {
        name: "C4 Ultimate Pre-Workout - Sour Batch Candy",
        code: "CEL-C4U-008",
        price: 44.99,
        description: "Pre-entreno de alta potencia con 300mg de cafeína, 6g de citrulina, 3.2g de beta-alanina y Cognizin para enfoque mental. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "https://images.unsplash.com/photo-1594737625785-8e8f133a5f4a?w=400&h=400&fit=crop",
        stock: 12,
    },
    {
        name: "MuscleTech Shatter Pre-Workout - Rainbow Candy",
        code: "MT-SH-009",
        price: 32.99,
        description: "Pre-entreno con 350mg de cafeína, 3g de beta-alanina y 1.5g de betaína. Energía intensa y pump vascular extremo. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop&sat=-50",
        stock: 8,
    },
    {
        name: "Ghost Legend All Out Pre-Workout - Sour Watermelon",
        code: "GHO-LEG-010",
        price: 39.99,
        description: "Pre-entreno premium con dosis completas de citrulina (6g), beta-alanina (3.2g), cafeína (250mg) y nootrópicos. Fórmula transparente. 20 porciones.",
        category: "Pre-entreno",
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop&sat=-30",
        stock: 25,
    },

    // ═══════════════════════ AMINOÁCIDOS ═══════════════════════
    {
        name: "Xtend Original BCAA - Mango Madness",
        code: "XT-BCAA-011",
        price: 27.99,
        description: "BCAAs 7g en ratio 2:1:1 con electrolitos y citrulina. Sin azúcar ni calorías. Recuperación muscular intra-entreno. 30 porciones.",
        category: "Aminoácidos",
        imageUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&hue=30",
        stock: 33,
    },
    {
        name: "Optimum Nutrition Essential Amino Energy - Wild Berry",
        code: "ON-AE-012",
        price: 22.99,
        description: "Aminoácidos esenciales con 100mg de cafeína natural. Energía ligera + recuperación. Ideal para cualquier hora del día. 30 porciones.",
        category: "Aminoácidos",
        imageUrl: "https://images.unsplash.com/photo-1622484211850-cc1f8f6e3f6e?w=400&h=400&fit=crop&hue=300",
        stock: 45,
    },
    {
        name: "Optimum Nutrition Glutamine Powder",
        code: "ON-GLU-013",
        price: 19.99,
        description: "L-Glutamina pura en polvo. 5g por porción para recuperación muscular y soporte del sistema inmune. Sin sabor. 300g.",
        category: "Aminoácidos",
        imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop&sat=-20",
        stock: 30,
    },

    // ═══════════════════════ GANADORES DE MASA ═══════════════════════
    {
        name: "Optimum Nutrition Serious Mass - Chocolate",
        code: "ON-SM-014",
        price: 64.99,
        description: "Ganador de masa con 1,250 calorías, 50g de proteína y 252g de carbohidratos por porción. Incluye creatina y glutamina. 6 lbs.",
        category: "Ganadores",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&hue=20",
        stock: 10,
    },
    {
        name: "Dymatize Super Mass Gainer - Rich Chocolate",
        code: "DYM-SMG-015",
        price: 52.99,
        description: "Ganador de masa con 1,280 calorías, 52g de proteína y BCAAs. Fórmula con enzimas digestivas para mejor absorción. 6 lbs.",
        category: "Ganadores",
        imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400&h=400&fit=crop&hue=15",
        stock: 14,
    },
    {
        name: "BSN True Mass 1200 - Strawberry Milkshake",
        code: "BSN-TM-016",
        price: 58.99,
        description: "Ganador ultra-premium con 1,220 calorías, 50g de proteína multi-fuente y grasas saludables de semillas de linaza y MCT. 4.73 kg.",
        category: "Ganadores",
        imageUrl: "https://images.unsplash.com/photo-1594737625785-8e8f133a5f4a?w=400&h=400&fit=crop&hue=340",
        stock: 7,
    },

    // ═══════════════════════ VITAMINAS & SALUD ═══════════════════════
    {
        name: "Optimum Nutrition Opti-Men Multivitamínico",
        code: "ON-OM-017",
        price: 21.99,
        description: "Multivitamínico para hombres activos con 75+ ingredientes. Incluye aminoácidos, antioxidantes, enzimas y minerales. 90 tabletas.",
        category: "Vitaminas",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4a6e8e8e1f3f?w=400&h=400&fit=crop",
        stock: 42,
    },
    {
        name: "NOW Foods Omega-3 Fish Oil 1000mg",
        code: "NOW-OM3-018",
        price: 14.99,
        description: "Aceite de pescado molecularmente destilado con 180mg EPA y 120mg DHA. Soporte cardiovascular y articular. 200 cápsulas.",
        category: "Vitaminas",
        imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=400&fit=crop",
        stock: 60,
    },
    {
        name: "Nature Made Vitamin D3 2000 IU",
        code: "NM-VD3-019",
        price: 11.99,
        description: "Vitamina D3 para soporte óseo, muscular e inmunológico. 2000 IU por softgel. Formulación farmacéutica. 220 softgels.",
        category: "Vitaminas",
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
        stock: 55,
    },
    {
        name: "Optimum Nutrition ZMA - Zinc Magnesio",
        code: "ON-ZMA-020",
        price: 18.99,
        description: "Combinación de Zinc, Magnesio y Vitamina B6 para recuperación nocturna, soporte hormonal y calidad de sueño. 90 cápsulas.",
        category: "Vitaminas",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4a6e8e8e1f3f?w=400&h=400&fit=crop&sat=-30",
        stock: 38,
    },
];

async function seed() {
    try {
        console.log('🌱 Iniciando seeding en PostgreSQL...');
        console.log(`📦 Host: ${poolConfig.host || 'localhost'}`);
        console.log(`📦 DB: ${poolConfig.database || 'powerfit'}`);

        // Limpiar productos existentes
        console.log("🔄 Limpiando productos existentes...");
        await pool.query("DELETE FROM cart_items");
        await pool.query("DELETE FROM products");
        console.log("✅ Productos anteriores eliminados\n");

        console.log("📦 Insertando 20 productos con imágenes de internet...\n");

        for (const p of products) {
            const id = `prod-${crypto.randomUUID().slice(0, 8)}`;

            await pool.query(`
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

            console.log(`  ✅ ${p.code} — ${p.name}`);
        }

        // Verificar
        const res = await pool.query("SELECT COUNT(*) as total FROM products");
        console.log(`\n🎉 ¡Catálogo creado! ${res.rows[0].total} productos insertados correctamente.`);

        // Resumen por categoría
        const categoriesRes = await pool.query("SELECT category, COUNT(*) as qty FROM products GROUP BY category ORDER BY qty DESC");
        console.log("\n📊 Resumen por categoría:");
        categoriesRes.rows.forEach((c: any) => console.log(`   ${c.category}: ${c.qty} productos`));

        console.log("\n🖼️  Todas las imágenes son URLs de internet (Unsplash)");

    } catch (error) {
        console.error('❌ Error en el seed:', error);
    } finally {
        await pool.end();
        console.log('\n👋 Conexión cerrada');
    }
}

seed();
