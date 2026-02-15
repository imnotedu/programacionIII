/**
 * Servidor Principal
 * 
 * Punto de entrada del backend. Inicializa la base de datos y arranca el servidor.
 */

import { createApp } from './app';
import { config, validateEnv } from './config/env';
import { initializeTables, createSuperAdmin, closeDatabase, seedProductsIfEmpty } from './config/database';

/**
 * Inicializa y arranca el servidor
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Iniciando servidor PowerFit...\n');

    // Validar variables de entorno
    validateEnv();

    // Inicializar base de datos
    console.log('📦 Inicializando base de datos...');
    initializeTables();
    await createSuperAdmin();
    await seedProductsIfEmpty();
    console.log('');

    // Crear aplicación Express
    const app = createApp();

    // Iniciar servidor
    const server = app.listen(config.port, () => {
      console.log('✅ Servidor iniciado exitosamente');
      console.log(`📍 URL: http://localhost:${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`🔐 CORS habilitado para: ${config.corsOrigin}`);
      console.log('\n📚 Endpoints disponibles:');
      console.log(`   GET  /                         - Información de la API`);
      console.log(`   GET  /api/health               - Health check`);
      console.log('\n🔐 Autenticación:');
      console.log(`   POST /api/auth/login           - Login de usuario`);
      console.log(`   POST /api/auth/register        - Registro de usuario`);
      console.log(`   GET  /api/auth/me              - Perfil de usuario (requiere auth)`);
      console.log('\n📦 Productos:');
      console.log(`   GET  /api/products             - Obtener todos los productos`);
      console.log(`   GET  /api/products/code/:code  - Obtener producto por código`);
      console.log(`   GET  /api/products/:id         - Obtener producto por ID`);
      console.log(`   POST /api/products             - Crear producto (admin)`);
      console.log(`   PUT  /api/products/:id         - Actualizar producto (admin)`);
      console.log(`   DEL  /api/products/:id         - Eliminar producto (admin)`);
      console.log('\n🛒 Carrito:');
      console.log(`   GET  /api/cart                 - Obtener carrito (requiere auth)`);
      console.log(`   POST /api/cart/items           - Agregar producto (requiere auth)`);
      console.log(`   PUT  /api/cart/items/:id       - Actualizar cantidad (requiere auth)`);
      console.log(`   DEL  /api/cart/items/:id       - Eliminar producto (requiere auth)`);
      console.log(`   DEL  /api/cart                 - Limpiar carrito (requiere auth)`);
      console.log('\n✨ Servidor listo para recibir peticiones\n');
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado');
        closeDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  SIGINT recibido, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado');
        closeDatabase();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();
