
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

async function testConnection() {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

    console.log('--- Probando credenciales ---');
    console.log(`User: ${DB_USER}`);
    console.log(`Pass: ${DB_PASSWORD ? '******' : '(vacio)'}`);
    console.log(`Host: ${DB_HOST}:${DB_PORT}`);
    console.log(`Target DB: ${DB_NAME}`);

    // 1. Probar conexión a base de datos por defecto 'postgres'
    console.log('\n[1/2] Intentando conectar a base de datos "postgres"...');
    const client1 = new Client({
        user: DB_USER,
        host: DB_HOST,
        database: 'postgres',
        password: DB_PASSWORD,
        port: parseInt(DB_PORT || '5432'),
    });

    try {
        await client1.connect();
        console.log('✅ ÉXITO: Credenciales correctas. Conectado a "postgres".');
        await client1.end();
    } catch (err: any) {
        console.error('❌ ERROR: No se pudo conectar a "postgres".');
        console.error(`   Mensaje: ${err.message}`);
        if (err.code === '28P01') console.error('   Causa: Contraseña incorrecta o usuario no existe.');
        return;
    }

    // 2. Probar conexión a base de datos destino 'powerfit'
    console.log(`\n[2/2] Intentando conectar a base de datos "${DB_NAME}"...`);
    const client2 = new Client({
        user: DB_USER,
        host: DB_HOST,
        database: DB_NAME,
        password: DB_PASSWORD,
        port: parseInt(DB_PORT || '5432'),
    });

    try {
        await client2.connect();
        console.log(`✅ ÉXITO: Base de datos "${DB_NAME}" existe y es accesible.`);
        await client2.end();
    } catch (err: any) {
        console.error(`❌ ERROR: No se pudo conectar a "${DB_NAME}".`);
        console.error(`   Mensaje: ${err.message}`);

        if (err.code === '3D000') {
            console.log(`\n⚠️  La base de datos "${DB_NAME}" NO EXISTE.`);
            console.log(`   Intentando crearla...`);

            try {
                const adminClient = new Client({
                    user: DB_USER,
                    host: DB_HOST,
                    database: 'postgres',
                    password: DB_PASSWORD,
                    port: parseInt(DB_PORT || '5432'),
                });
                await adminClient.connect();
                await adminClient.query(`CREATE DATABASE "${DB_NAME}"`);
                console.log(`✅ Base de datos "${DB_NAME}" CREADA EXITOSAMENTE.`);
                await adminClient.end();
            } catch (createErr: any) {
                console.error(`❌ Falló la creación automática: ${createErr.message}`);
            }
        }
    }
}

testConnection();
