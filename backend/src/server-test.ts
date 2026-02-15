/**
 * Servidor de Prueba (Sin Base de Datos)
 * 
 * Punto de entrada temporal para probar la configuración de EJS sin base de datos.
 */

import { createApp } from './app';
import { config, validateEnv } from './config/env';

/**
 * Inicializa y arranca el servidor
 */
async function startServer(): Promise<void> {
  try {
    console.log('🚀 Iniciando servidor PowerFit (Modo Test - Sin BD)...\n');

    // Validar variables de entorno
    validateEnv();

    // Crear aplicación Express
    const app = createApp();

    // Iniciar servidor
    const server = app.listen(config.port, () => {
      console.log('✅ Servidor iniciado exitosamente');
      console.log(`📍 URL: http://localhost:${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`🔐 CORS habilitado para: ${config.corsOrigin}`);
      console.log('\n📚 Test Endpoints:');
      console.log(`   GET  /test-ejs                 - Test de configuración EJS`);
      console.log(`   GET  /api/health               - Health check`);
      console.log('\n✨ Servidor listo para recibir peticiones\n');
    });

    // Manejo de cierre graceful
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM recibido, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  SIGINT recibido, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado');
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
