/**
 * Rutas Principales
 * 
 * Centraliza todas las rutas de la API.
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de health check

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
