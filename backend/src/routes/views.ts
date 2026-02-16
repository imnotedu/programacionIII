/**
 * Rutas de Vistas
 * 
 * Define todas las rutas para renderizar páginas EJS.
 * Incluye rutas públicas, protegidas y de administración.
 * 
 * Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Router } from 'express';
import { ViewController } from '../controllers/viewController';
import { requireAuth, requireAdmin, redirectIfAuth } from '../middleware/auth';

const router = Router();
const viewController = new ViewController();

// ============================================================================
// Rutas Públicas
// ============================================================================

/**
 * Página de inicio
 * GET /
 * Requisito: 5.1
 */
router.get('/', (req, res) => viewController.home(req, res));

/**
 * Página de tienda
 * GET /tienda
 * Requisito: 5.2
 */
router.get('/tienda', (req, res) => viewController.store(req, res));

/**
 * Detalle de producto
 * GET /producto/:id
 * Requisito: 5.3
 */
router.get('/producto/:id', (req, res) => viewController.productDetail(req, res));

/**
 * Carrito de compras
 * GET /carrito
 * Requisito: 5.4
 */
router.get('/carrito', (req, res) => viewController.cart(req, res));

/**
 * Favoritos
 * GET /favoritos
 * Requisito: 5.5
 */
router.get('/favoritos', (req, res) => viewController.favorites(req, res));

// ============================================================================
// Rutas de Autenticación
// ============================================================================

/**
 * Página de login
 * GET /login
 * Redirige a / si ya está autenticado
 * Requisito: 5.6
 */
router.get('/login', redirectIfAuth, (req, res) => viewController.login(req, res));

/**
 * Página de registro
 * GET /register
 * Redirige a / si ya está autenticado
 * Requisito: 5.7
 */
router.get('/register', redirectIfAuth, (req, res) => viewController.register(req, res));

// ============================================================================
// Rutas Protegidas (Requieren Autenticación)
// ============================================================================

/**
 * Página de checkout
 * GET /checkout
 * Requiere autenticación
 * Requisitos: 6.1, 6.3
 */
router.get('/checkout', requireAuth, (req, res) => viewController.checkout(req, res));

// ============================================================================
// Rutas de Administración (Requieren Autenticación + Admin)
// ============================================================================

/**
 * Panel de administración de productos
 * GET /admin-products
 * Requiere autenticación y rol de administrador
 * Requisitos: 6.2, 6.4
 */
router.get('/admin-products', requireAuth, requireAdmin, (req, res) =>
  viewController.adminProducts(req, res)
);

// ============================================================================
// Rutas de Error
// ============================================================================

/**
 * Página de acceso denegado
 * GET /access-denied
 * Requisito: 6.5
 */
router.get('/access-denied', (req, res) => viewController.accessDenied(req, res));

export default router;
