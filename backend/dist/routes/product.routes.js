"use strict";
/**
 * Rutas de Productos
 *
 * Define las rutas para el CRUD de productos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/products
 * Obtener todos los productos
 * Público
 */
router.get('/', product_controller_1.getAllProducts);
/**
 * GET /api/products/code/:code
 * Obtener un producto por código
 * Público
 */
router.get('/code/:code', product_controller_1.getProductByCode);
/**
 * GET /api/products/:id
 * Obtener un producto por ID
 * Público
 */
router.get('/:id', product_controller_1.getProductById);
/**
 * POST /api/products
 * Crear un nuevo producto
 * Requiere: Autenticación + Admin
 */
router.post('/', auth_1.authenticate, auth_1.requireAdmin, product_controller_1.createProduct);
/**
 * PUT /api/products/:id
 * Actualizar un producto
 * Requiere: Autenticación + Admin
 */
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, product_controller_1.updateProduct);
/**
 * DELETE /api/products/:id
 * Eliminar un producto
 * Requiere: Autenticación + Admin
 */
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, product_controller_1.deleteProduct);
exports.default = router;
