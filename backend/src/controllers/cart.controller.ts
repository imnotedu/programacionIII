/**
 * Controlador de Carrito
 * 
 * Maneja las operaciones del carrito de compras.
 * Todas las operaciones requieren autenticación.
 */

import { Request, Response, NextFunction } from 'express';
import { query, getClient } from '../config/database';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schemas';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Obtener o crear carrito para un usuario
 */
async function getOrCreateCart(userId: string): Promise<any> {
    // Buscar carrito existente
    const res = await query('SELECT * FROM carts WHERE userId = $1', [userId]);
    let cart = res.rows[0];

    if (!cart) {
        // Crear nuevo carrito
        const cartId = `cart-${Date.now()}`;
        const now = new Date().toISOString();

        await query(`
          INSERT INTO carts (id, userId, createdAt, updatedAt)
          VALUES ($1, $2, $3, $4)
        `, [cartId, userId, now, now]);

        const newCartRes = await query('SELECT * FROM carts WHERE id = $1', [cartId]);
        cart = newCartRes.rows[0];
    }

    return cart;
}

/**
 * Obtener carrito con items y productos
 */
async function getCartWithItems(userId: string): Promise<any> {
    const cart = await getOrCreateCart(userId);

    // Obtener items con información del producto
    const itemsRes = await query(`
        SELECT 
          ci.id, ci.cartId, ci.productId, ci.quantity, ci.createdAt, ci.updatedAt,
          p.id as product_id,
          p.name as product_name,
          p.code as product_code,
          p.price as product_price,
          p.description as product_description,
          p.category as product_category,
          p.imageUrl as product_imageurl,
          p.stock as product_stock
        FROM cart_items ci
        INNER JOIN products p ON ci.productId = p.id
        WHERE ci.cartId = $1
        ORDER BY ci.createdAt DESC
      `, [cart.id]);

    const items = itemsRes.rows;

    // Formatear items con subtotales
    const formattedItems = items.map((item: any) => {
        const price = parseFloat(item.product_price);
        return {
            id: item.id,
            cartId: item.cartid || item.cartId,
            productId: item.productid || item.productId,
            quantity: item.quantity,
            createdAt: item.createdat || item.createdAt,
            updatedAt: item.updatedat || item.updatedAt,
            product: {
                id: item.product_id,
                name: item.product_name,
                code: item.product_code,
                price: price,
                description: item.product_description,
                category: item.product_category,
                imageUrl: item.product_imageurl,
                stock: item.product_stock
            },
            subtotal: price * item.quantity
        };
    });

    // Calcular total
    const total = formattedItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    return {
        cart: {
            id: cart.id,
            userId: cart.userid || cart.userId,
            createdAt: cart.createdat || cart.createdAt,
            updatedAt: cart.updatedat || cart.updatedAt
        },
        items: formattedItems,
        total,
        itemCount: formattedItems.length
    };
}

/**
 * Obtener carrito del usuario
 * GET /api/cart
 * Requiere: Autenticación
 */
export async function getCart(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const cartData = await getCartWithItems(userId);

        res.json({
            success: true,
            data: cartData
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Agregar producto al carrito
 * POST /api/cart/items
 * Requiere: Autenticación
 */
export async function addItem(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const data = addToCartSchema.parse(req.body);

        // Verificar que el producto existe
        const productRes = await query('SELECT * FROM products WHERE id = $1', [data.productId]);
        const product = productRes.rows[0];

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        // Obtener o crear carrito
        const cart = await getOrCreateCart(userId);

        // Verificar si el producto ya está en el carrito
        const existingItemRes = await query(`
          SELECT * FROM cart_items WHERE cartId = $1 AND productId = $2
        `, [cart.id, data.productId]);

        const existingItem = existingItemRes.rows[0];

        if (existingItem) {
            // Actualizar cantidad existente
            const newQuantity = existingItem.quantity + data.quantity;

            // Verificar stock
            if (newQuantity > product.stock) {
                throw new ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
            }

            const now = new Date().toISOString();

            await query(`
            UPDATE cart_items 
            SET quantity = $1, updatedAt = $2
            WHERE id = $3
          `, [newQuantity, now, existingItem.id]);

            // Actualizar timestamp del carrito
            await query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

            const updatedItemRes = await query('SELECT * FROM cart_items WHERE id = $1', [existingItem.id]);

            res.json({
                success: true,
                data: { item: updatedItemRes.rows[0] },
                message: 'Cantidad actualizada en el carrito'
            });
        } else {
            // Verificar stock
            if (data.quantity > product.stock) {
                throw new ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
            }

            // Crear nuevo item
            const itemId = `item-${Date.now()}`;
            const now = new Date().toISOString();

            await query(`
            INSERT INTO cart_items (id, cartId, productId, quantity, createdAt, updatedAt)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [itemId, cart.id, data.productId, data.quantity, now, now]);

            // Actualizar timestamp del carrito
            await query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

            const newItemRes = await query('SELECT * FROM cart_items WHERE id = $1', [itemId]);

            res.status(201).json({
                success: true,
                data: { item: newItemRes.rows[0] },
                message: 'Producto agregado al carrito'
            });
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Actualizar cantidad de un producto en el carrito
 * PUT /api/cart/items/:productId
 * Requiere: Autenticación
 */
export async function updateItem(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { productId } = req.params;
        const data = updateCartItemSchema.parse(req.body);

        // Verificar que el producto existe
        const productRes = await query('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productRes.rows[0];

        if (!product) {
            throw new NotFoundError('Producto no encontrado');
        }

        // Verificar stock
        if (data.quantity > product.stock) {
            throw new ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
        }

        // Obtener carrito
        const cart = await getOrCreateCart(userId);

        // Buscar item en el carrito
        const itemRes = await query(`
          SELECT * FROM cart_items WHERE cartId = $1 AND productId = $2
        `, [cart.id, productId]);
        const item = itemRes.rows[0];

        if (!item) {
            throw new NotFoundError('Producto no encontrado en el carrito');
        }

        // Actualizar cantidad
        const now = new Date().toISOString();

        await query(`
          UPDATE cart_items 
          SET quantity = $1, updatedAt = $2
          WHERE id = $3
        `, [data.quantity, now, item.id]);

        // Actualizar timestamp del carrito
        await query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

        const updatedItemRes = await query('SELECT * FROM cart_items WHERE id = $1', [item.id]);

        res.json({
            success: true,
            data: { item: updatedItemRes.rows[0] },
            message: 'Cantidad actualizada'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Eliminar producto del carrito
 * DELETE /api/cart/items/:productId
 * Requiere: Autenticación
 */
export async function removeItem(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { productId } = req.params;

        // Obtener carrito
        const cart = await getOrCreateCart(userId);

        // Buscar item en el carrito
        const itemRes = await query(`
          SELECT * FROM cart_items WHERE cartId = $1 AND productId = $2
        `, [cart.id, productId]);
        const item = itemRes.rows[0];

        if (!item) {
            throw new NotFoundError('Producto no encontrado en el carrito');
        }

        // Eliminar item
        await query('DELETE FROM cart_items WHERE id = $1', [item.id]);

        // Actualizar timestamp del carrito
        const now = new Date().toISOString();
        await query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

        res.json({
            success: true,
            message: 'Producto eliminado del carrito'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Limpiar carrito completo
 * DELETE /api/cart
 * Requiere: Autenticación
 */
export async function clearCart(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = req.user!.userId;

        // Obtener carrito
        const cart = await getOrCreateCart(userId);

        // Eliminar todos los items
        await query('DELETE FROM cart_items WHERE cartId = $1', [cart.id]);

        // Actualizar timestamp del carrito
        const now = new Date().toISOString();
        await query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

        res.json({
            success: true,
            message: 'Carrito vaciado exitosamente'
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Procesar checkout (compra)
 * POST /api/cart/checkout
 * Requiere: Autenticación
 * 
 * Descuenta el stock de cada producto comprado y vacía el carrito.
 * Todo se ejecuta dentro de una transacción para garantizar consistencia.
 */
export async function checkout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const client = await getClient(); // Obtener cliente dedicado para transacción

    try {
        const userId = req.user!.userId;

        // Obtener carrito con items (usando query simple para obtener IDs)
        const cart = await getOrCreateCart(userId);

        const itemsRes = await query(`
          SELECT ci.*, p.stock as product_stock, p.name as product_name
          FROM cart_items ci
          INNER JOIN products p ON ci.productId = p.id
          WHERE ci.cartId = $1
        `, [cart.id]);

        const items = itemsRes.rows;

        if (items.length === 0) {
            throw new ConflictError('El carrito está vacío');
        }

        // Validar stock antes de procesar
        for (const item of items) {
            if (item.quantity > item.product_stock) {
                throw new ConflictError(
                    `Stock insuficiente para "${item.product_name}". Disponible: ${item.product_stock}, solicitado: ${item.quantity}`
                );
            }
        }

        // INICIAR TRANSACCIÓN
        await client.query('BEGIN');
        const now = new Date().toISOString();

        // Descontar stock de cada producto
        for (const item of items) {
            // Verificar stock nuevamente dentro de la transacción por si cambió concurrentemente
            const pid = item.productid || item.productId;

            const checkStock = await client.query('SELECT stock FROM products WHERE id = $1 FOR UPDATE', [pid]); // FOR UPDATE bloquea la fila
            const currentStock = checkStock.rows[0].stock;

            if (currentStock < item.quantity) {
                throw new ConflictError(`Stock insuficiente para producto ${item.product_name} durante el procesamiento.`);
            }

            await client.query(`
              UPDATE products 
              SET stock = stock - $1, updatedAt = $2
              WHERE id = $3
            `, [item.quantity, now, pid]);
        }

        // Vaciar el carrito
        await client.query('DELETE FROM cart_items WHERE cartId = $1', [cart.id]);

        // Actualizar timestamp del carrito
        await client.query('UPDATE carts SET updatedAt = $1 WHERE id = $2', [now, cart.id]);

        // COMMIT
        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Compra procesada exitosamente. Stock actualizado.',
            data: {
                itemsProcessed: items.length,
                totalItems: items.reduce((sum: number, item: any) => sum + item.quantity, 0)
            }
        });
    } catch (error) {
        // ROLLBACK en caso de error
        await client.query('ROLLBACK');
        next(error);
    } finally {
        // Liberar cliente
        client.release();
    }
}
