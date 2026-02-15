/**
 * Rutas Principales
 * 
 * Centraliza todas las rutas de la API.
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import sessionCartRoutes from './sessionCart.routes';
import favoritesRoutes from './favorites.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de productos
router.use('/products', productRoutes);

// Rutas de carrito (base de datos - requiere autenticación)
router.use('/cart-db', cartRoutes);

// Rutas de carrito basado en sesión (no requiere autenticación)
router.use('/cart', sessionCartRoutes);

// Rutas de favoritos basado en sesión
router.use('/favorites', favoritesRoutes);

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
