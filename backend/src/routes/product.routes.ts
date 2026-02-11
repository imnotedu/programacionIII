/**
 * Rutas de Productos
 * 
 * Define las rutas para el CRUD de productos.
 */

import { Router } from 'express';
import {
    createProduct,
    getAllProducts,
    getProductByCode,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/products
 * Obtener todos los productos
 * Público
 */
router.get('/', getAllProducts);

/**
 * GET /api/products/code/:code
 * Obtener un producto por código
 * Público
 */
router.get('/code/:code', getProductByCode);

/**
 * GET /api/products/:id
 * Obtener un producto por ID
 * Público
 */
router.get('/:id', getProductById);

/**
 * POST /api/products
 * Crear un nuevo producto
 * Requiere: Autenticación + Admin
 */
router.post('/', authenticate, requireAdmin, createProduct);

/**
 * PUT /api/products/:id
 * Actualizar un producto
 * Requiere: Autenticación + Admin
 */
router.put('/:id', authenticate, requireAdmin, updateProduct);

/**
 * DELETE /api/products/:id
 * Eliminar un producto
 * Requiere: Autenticación + Admin
 */
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
