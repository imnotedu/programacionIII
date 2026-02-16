/**
 * Controlador de Productos
 * 
 * Maneja las operaciones CRUD de productos.
 * Solo usuarios admin pueden crear, actualizar y eliminar productos.
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { createProductSchema, updateProductSchema } from '../schemas/product.schemas';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Crear un nuevo producto
 * POST /api/products
 * Requiere: Autenticación + Admin
 */
export async function createProduct(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        // Procesar imagen si existe
        if (req.file) {
            req.body.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Convertir strings a números (multer multipart/form-data)
        if (req.body.price) req.body.price = parseFloat(req.body.price);
        if (req.body.stock) req.body.stock = parseInt(req.body.stock, 10);

        // Auto-generar código si no viene del formulario
        if (!req.body.code && req.body.name) {
            req.body.code = req.body.name
                .trim()
                .toUpperCase()
                .replace(/\s+/g, '-')
                .replace(/[^A-Z0-9\-]/g, '')
                .substring(0, 50);
        }

        // Validar datos
        const data = createProductSchema.parse(req.body);

        // Verificar si el código ya existe
        const existing = await query('SELECT id FROM products WHERE code = $1', [data.code]);

        if (existing.rows.length > 0) {
            throw new ConflictError('Ya existe un producto con este código');
        }

        // Crear producto
        const productId = `prod-${Date.now()}`;
        const now = new Date().toISOString();

        await query(`
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
        const productRes = await query('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productRes.rows[0];

        const mappedProduct = mapProductFromDb(product);

        // Detectar si viene de un formulario HTML o de la API
        const isFormSubmit = !req.xhr && !req.headers.accept?.includes('application/json');
        if (isFormSubmit) {
            req.flash('success', 'Producto creado exitosamente');
            res.redirect('/admin-products');
            return;
        }

        res.status(201).json({
            success: true,
            data: { product: mappedProduct }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Buscar productos (para autocomplete)
 * GET /api/products/search
 * Público
 */
export async function searchProducts(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.trim().length < 2) {
            res.json({
                success: true,
                data: { products: [] }
            });
            return;
        }

        const searchTerm = `%${q.trim().toLowerCase()}%`;

        // Buscar en nombre y descripción, limitar a 5 resultados
        const productsRes = await query(`
            SELECT id, name, description, price, imageUrl, category, stock
            FROM products 
            WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $1
            ORDER BY 
                CASE 
                    WHEN LOWER(name) LIKE $1 THEN 1
                    ELSE 2
                END,
                name
            LIMIT 5
        `, [searchTerm]);

        const products = productsRes.rows.map(mapProductFromDb);

        res.json({
            success: true,
            data: { products }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Obtener todos los productos
 * GET /api/products
 * Público
 */
export async function getAllProducts(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const productsRes = await query('SELECT * FROM products ORDER BY createdAt DESC');
        const products = productsRes.rows.map(mapProductFromDb);

        res.json({
            success: true,
            data: {
                products,
                count: products.length
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Obtener un producto por código
 * GET /api/products/code/:code
 * Público
 */
export async function getProductByCode(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { code } = req.params;

        // Asegurar que code sea string antes de usar toUpperCase
        const codeStr = Array.isArray(code) ? code[0] : code;
        const productRes = await query('SELECT * FROM products WHERE code = $1', [codeStr.toUpperCase()]);
        const product = productRes.rows[0];

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Obtener un producto por ID
 * GET /api/products/:id
 * Público
 */
export async function getProductById(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        const productRes = await query('SELECT * FROM products WHERE id = $1', [id]);
        const product = productRes.rows[0];

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Actualizar un producto
 * PUT /api/products/:id
 * Requiere: Autenticación + Admin
 */
export async function updateProduct(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        // Procesar imagen si existe
        if (req.file) {
            req.body.imageUrl = `/uploads/${req.file.filename}`;
        }

        // Convertir strings a números si existen
        if (req.body.price) req.body.price = parseFloat(req.body.price);
        if (req.body.stock) req.body.stock = parseInt(req.body.stock, 10);

        // Remover el código del body si viene (no se puede actualizar)
        delete req.body.code;

        const data = updateProductSchema.parse(req.body);

        // Verificar que el producto existe
        const existing = await query('SELECT id FROM products WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            throw new NotFoundError('Producto no encontrado');
        }

        // Construir query de actualización dinámicamente
        const fields = Object.keys(data);
        if (fields.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        // Postgres usa $1, $2, etc.
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        const values = fields.map(field => data[field as keyof typeof data]);

        const now = new Date().toISOString();

        // values termina en index = fields.length
        // updatedAt param index = fields.length + 1
        // id param index = fields.length + 2

        await query(`
      UPDATE products 
      SET ${setClause}, updatedAt = $${fields.length + 1}
      WHERE id = $${fields.length + 2}
    `, [...values, now, id]);

        // Obtener el producto actualizado
        const productRes = await query('SELECT * FROM products WHERE id = $1', [id]);
        const product = productRes.rows[0];

        // Detectar si viene de un formulario HTML o de la API
        const isFormSubmit = !req.xhr && !req.headers.accept?.includes('application/json');
        if (isFormSubmit) {
            req.flash('success', 'Producto actualizado exitosamente');
            res.redirect('/admin-products');
            return;
        }

        res.json({
            success: true,
            data: { product: mapProductFromDb(product) }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Eliminar un producto
 * DELETE /api/products/:id
 * Requiere: Autenticación + Admin
 */
export async function deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { id } = req.params;

        // Verificar que el producto existe
        const existing = await query('SELECT id FROM products WHERE id = $1', [id]);

        if (existing.rows.length === 0) {
            throw new NotFoundError('Producto no encontrado');
        }

        // Eliminar producto
        await query('DELETE FROM products WHERE id = $1', [id]);

        // Detectar si viene de un formulario HTML o de la API
        const isFormSubmit = !req.xhr && !req.headers.accept?.includes('application/json');
        if (isFormSubmit) {
            req.flash('success', 'Producto eliminado exitosamente');
            res.redirect('/admin-products');
            return;
        }

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Helper para mapear resultados de la BD (posibles minúsculas) a camelCase
 */
function mapProductFromDb(row: any): any {
    if (!row) return null;
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
