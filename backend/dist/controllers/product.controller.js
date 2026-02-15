"use strict";
/**
 * Controlador de Productos
 *
 * Maneja las operaciones CRUD de productos.
 * Solo usuarios admin pueden crear, actualizar y eliminar productos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.getProductByCode = getProductByCode;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const database_1 = require("../config/database");
const product_schemas_1 = require("../schemas/product.schemas");
const errors_1 = require("../utils/errors");
/**
 * Crear un nuevo producto
 * POST /api/products
 * Requiere: Autenticación + Admin
 */
async function createProduct(req, res, next) {
    try {
        // Validar datos
        const data = product_schemas_1.createProductSchema.parse(req.body);
        // Verificar si el código ya existe
        const existing = await (0, database_1.query)('SELECT id FROM products WHERE code = $1', [data.code]);
        if (existing.rows.length > 0) {
            throw new errors_1.ConflictError('Ya existe un producto con este código');
        }
        // Crear producto
        const productId = `prod-${Date.now()}`;
        const now = new Date().toISOString();
        await (0, database_1.query)(`
      INSERT INTO products (id, name, code, price, description, category, imageUrl, stock, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
            productId,
            data.name,
            data.code,
            data.price,
            data.description,
            data.category,
            data.imageUrl || null,
            data.stock || 0,
            now,
            now
        ]);
        // Obtener el producto creado
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productRes.rows[0];
        const mappedProduct = mapProductFromDb(product);
        res.status(201).json({
            success: true,
            data: { product: mappedProduct }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Obtener todos los productos
 * GET /api/products
 * Público
 */
async function getAllProducts(req, res, next) {
    try {
        const productsRes = await (0, database_1.query)('SELECT * FROM products ORDER BY createdAt DESC');
        const products = productsRes.rows.map(mapProductFromDb);
        res.json({
            success: true,
            data: {
                products,
                count: products.length
            }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Obtener un producto por código
 * GET /api/products/code/:code
 * Público
 */
async function getProductByCode(req, res, next) {
    try {
        const { code } = req.params;
        // Asegurar que code sea string antes de usar toUpperCase
        const codeStr = Array.isArray(code) ? code[0] : code;
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE code = $1', [codeStr.toUpperCase()]);
        const product = productRes.rows[0];
        if (!product) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Obtener un producto por ID
 * GET /api/products/:id
 * Público
 */
async function getProductById(req, res, next) {
    try {
        const { id } = req.params;
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [id]);
        const product = productRes.rows[0];
        if (!product) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Actualizar un producto
 * PUT /api/products/:id
 * Requiere: Autenticación + Admin
 */
async function updateProduct(req, res, next) {
    try {
        const { id } = req.params;
        const data = product_schemas_1.updateProductSchema.parse(req.body);
        // Verificar que el producto existe
        const existing = await (0, database_1.query)('SELECT id FROM products WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        // Construir query de actualización dinámicamente
        const fields = Object.keys(data);
        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }
        // Postgres usa $1, $2, etc.
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = fields.map(field => data[field]);
        const now = new Date().toISOString();
        // values termina en index = fields.length
        // updatedAt param index = fields.length + 1
        // id param index = fields.length + 2
        await (0, database_1.query)(`
      UPDATE products 
      SET ${setClause}, updatedAt = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
    `, [...values, now, id]);
        // Obtener el producto actualizado
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [id]);
        const product = productRes.rows[0];
        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Eliminar un producto
 * DELETE /api/products/:id
 * Requiere: Autenticación + Admin
 */
async function deleteProduct(req, res, next) {
    try {
        const { id } = req.params;
        // Verificar que el producto existe
        const existing = await (0, database_1.query)('SELECT id FROM products WHERE id = $1', [id]);
        if (existing.rows.length === 0) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        // Eliminar producto
        await (0, database_1.query)('DELETE FROM products WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Helper para mapear resultados de la BD (posibles minúsculas) a camelCase
 */
function mapProductFromDb(row) {
    if (!row)
        return null;
    const imageUrl = row.imageurl || row.imageUrl;
    return {
        id: row.id,
        name: row.name,
        code: row.code,
        price: parseFloat(row.price), // Postgres devuelve decimales como strings
        description: row.description,
        category: row.category,
        imageUrl: imageUrl, // Handle lowercase casing from PG
        image: imageUrl, // Alias para las vistas EJS
        stock: row.stock,
        createdAt: row.createdat || row.createdAt,
        updatedAt: row.updatedat || row.updatedAt
    };
}
