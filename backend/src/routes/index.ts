/**
 * Rutas Principales
 * 
 * Centraliza todas las rutas de la API.
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de productos
router.use('/products', productRoutes);

// Rutas de carrito
router.use('/cart', cartRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
