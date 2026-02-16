/**
 * Rutas de Productos
 * 
 * Define las rutas para el CRUD de productos.
 */

import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
    createProduct,
    getAllProducts,
    getProductByCode,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
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
 * GET /api/products/search
 * Buscar productos (autocomplete)
 * Público
 */
router.get('/search', searchProducts);

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
router.post('/', authenticate, requireAdmin, upload.single('image'), createProduct);

/**
 * PUT /api/products/:id
 * Actualizar un producto
 * Requiere: Autenticación + Admin
 */
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateProduct);

/**
 * DELETE /api/products/:id
 * Eliminar un producto
 * Requiere: Autenticación + Admin
 */
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
