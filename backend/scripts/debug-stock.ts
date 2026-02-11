
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432', 10),
    };

const pool = new Pool(poolConfig);

async function debugStock() {
    console.log("🛠️ Iniciando debug de stock...");
    const client = await pool.connect();

    try {
        // 1. Obtener un producto al azar
        const pRes = await client.query('SELECT * FROM products LIMIT 1');
        const product = pRes.rows[0];
        console.log(`📦 Producto de prueba: ${product.name} (ID: ${product.id})`);
        console.log(`📊 Stock INICIAL: ${product.stock}`);

        // 2. Simular cantidad de compra
        const buyQty = 2;
        console.log(`🛒 Simulando compra de: ${buyQty} unidades`);

        // 3. Ejecutar UPDATE tal cual está en el controlador
        const now = new Date().toISOString();
        const pid = product.id; // simulation of pid resolution

        // Query exacta del controlador
        await client.query(`
            UPDATE products 
            SET stock = stock - $1, updatedAt = $2
            WHERE id = $3
        `, [buyQty, now, pid]);

        // 4. Verificar stock final
        const pResFinal = await client.query('SELECT stock FROM products WHERE id = $1', [pid]);
        const finalStock = pResFinal.rows[0].stock;
        console.log(`📊 Stock FINAL: ${finalStock}`);

        if (finalStock === product.stock - buyQty) {
            console.log("✅ La lógica de resta FUNCIONA correctamente.");
        } else {
            console.log("❌ ALERTA: El stock NO se redujo correctamente.");
            console.log(`   Esperado: ${product.stock - buyQty}, Real: ${finalStock}`);
            console.log(`   Diferencia: ${finalStock - product.stock}`);
        }

        // 5. Rollback manual (volver a poner el stock como estaba para no ensuciar)
        // Ojo: en un script de debug quizas queremos ver el cambio.
        // Pero para ser limpios, restablecemos.
        await client.query('UPDATE products SET stock = $1 WHERE id = $2', [product.stock, pid]);
        console.log("🔄 Stock restaurado al valor original.");

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

debugStock();
