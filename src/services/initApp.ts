/**
 * Application Initialization
 * 
 * Script de inicialización de la aplicación.
 * Verifica la conexión con el backend.
 */

/**
 * Inicializa la aplicación
 * - Verifica que el backend esté disponible
 */
export async function initializeApp(): Promise<void> {
  console.log('🚀 Inicializando aplicación PowerFit...');

  try {
    // Verificar conexión con el backend
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      console.log('✅ Conexión con backend establecida');
    } else {
      console.warn('⚠️ Backend respondió con error, pero la app continuará');
    }

    console.log('✅ Aplicación inicializada correctamente');
  } catch (error) {
    // Si el backend no está disponible, la app continúa de todos modos
    console.warn('⚠️ No se pudo conectar al backend:', error);
    console.log('✅ Aplicación inicializada (modo offline)');
  }
}
