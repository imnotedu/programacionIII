"use strict";
/**
 * Servidor de Prueba (Sin Base de Datos)
 *
 * Punto de entrada temporal para probar la configuración de EJS sin base de datos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
/**
 * Inicializa y arranca el servidor
 */
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor PowerFit (Modo Test - Sin BD)...\n');
        // Validar variables de entorno
        (0, env_1.validateEnv)();
        // Crear aplicación Express
        const app = (0, app_1.createApp)();
        // Iniciar servidor
        const server = app.listen(env_1.config.port, () => {
            console.log('✅ Servidor iniciado exitosamente');
            console.log(`📍 URL: http://localhost:${env_1.config.port}`);
            console.log(`🌍 Entorno: ${env_1.config.nodeEnv}`);
            console.log(`🔐 CORS habilitado para: ${env_1.config.corsOrigin}`);
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
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
// Iniciar servidor
startServer();
