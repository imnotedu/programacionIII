"use strict";
/**
 * Controlador de Carrito basado en Sesión
 *
 * Maneja las operaciones del carrito de compras usando sesiones.
 * No requiere autenticación - funciona para usuarios anónimos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeFromCart = removeFromCart;
exports.clearSessionCart = clearSessionCart;
const database_1 = require("../config/database");
const cart_schemas_1 = require("../schemas/cart.schemas");
const errors_1 = require("../utils/errors");
/**
 * Inicializar carrito en sesión si no existe
 */
function initializeCart(req) {
    if (!req.session.cart) {
        req.session.cart = [];
    }
}
/**
 * Calcular total del carrito
 */
async function calculateCartTotal(cartItems) {
    if (cartItems.length === 0) {
        return { total: 0, cartCount: 0 };
    }
    const productIds = cartItems.map(item => item.productId);
    const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
    const productsRes = await (0, database_1.query)(`SELECT id, price FROM products WHERE id IN (${placeholders})`, productIds);
    const products = productsRes.rows;
    let total = 0;
    let cartCount = 0;
    for (const item of cartItems) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
            total += parseFloat(product.price) * item.quantity;
            cartCount += item.quantity;
        }
    }
    return { total, cartCount };
}
/**
 * Agregar producto al carrito de la sesión
 * POST /api/cart/add
 */
async function addToCart(req, res, next) {
    try {
        const data = cart_schemas_1.addToCartSchema.parse(req.body);
        initializeCart(req);
        // Verificar que el producto existe
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [data.productId]);
        const product = productRes.rows[0];
        if (!product) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        // Buscar si el producto ya está en el carrito
        const existingItemIndex = req.session.cart.findIndex(item => item.productId === data.productId);
        if (existingItemIndex !== -1) {
            // Actualizar cantidad existente
            const newQuantity = req.session.cart[existingItemIndex].quantity + data.quantity;
            // Verificar stock
            if (newQuantity > product.stock) {
                throw new errors_1.ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
            }
            req.session.cart[existingItemIndex].quantity = newQuantity;
        }
        else {
            // Verificar stock
            if (data.quantity > product.stock) {
                throw new errors_1.ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
            }
            // Agregar nuevo item
            req.session.cart.push({
                productId: data.productId,
                quantity: data.quantity
            });
        }
        // Calcular total y contador
        const { total, cartCount } = await calculateCartTotal(req.session.cart);
        // Mensaje flash de éxito
        req.flash('success', 'Producto agregado al carrito exitosamente');
        res.json({
            success: true,
            message: 'Producto agregado al carrito',
            cartCount,
            total
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Actualizar cantidad de un producto en el carrito
 * PUT /api/cart/update
 */
async function updateCartItem(req, res, next) {
    try {
        const { productId } = req.body;
        const data = cart_schemas_1.updateCartItemSchema.parse(req.body);
        initializeCart(req);
        if (!productId) {
            throw new errors_1.NotFoundError('productId es requerido');
        }
        // Verificar que el producto existe
        const productRes = await (0, database_1.query)('SELECT * FROM products WHERE id = $1', [productId]);
        const product = productRes.rows[0];
        if (!product) {
            throw new errors_1.NotFoundError('Producto no encontrado');
        }
        // Verificar stock
        if (data.quantity > product.stock) {
            throw new errors_1.ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
        }
        // Buscar item en el carrito
        const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            throw new errors_1.NotFoundError('Producto no encontrado en el carrito');
        }
        // Actualizar cantidad
        req.session.cart[itemIndex].quantity = data.quantity;
        // Calcular total y contador
        const { total, cartCount } = await calculateCartTotal(req.session.cart);
        // Calcular subtotal del item actualizado
        const itemSubtotal = parseFloat(product.price) * data.quantity;
        // Mensaje flash de éxito
        req.flash('success', 'Cantidad actualizada correctamente');
        res.json({
            success: true,
            message: 'Cantidad actualizada',
            cartCount,
            total,
            item: {
                productId,
                quantity: data.quantity,
                subtotal: itemSubtotal
            }
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Eliminar producto del carrito
 * DELETE /api/cart/remove
 */
async function removeFromCart(req, res, next) {
    try {
        const { productId } = req.body;
        initializeCart(req);
        if (!productId) {
            throw new errors_1.NotFoundError('productId es requerido');
        }
        // Buscar item en el carrito
        const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
        if (itemIndex === -1) {
            throw new errors_1.NotFoundError('Producto no encontrado en el carrito');
        }
        // Eliminar item
        req.session.cart.splice(itemIndex, 1);
        // Calcular total y contador
        const { total, cartCount } = await calculateCartTotal(req.session.cart);
        // Mensaje flash de éxito
        req.flash('success', 'Producto eliminado del carrito');
        res.json({
            success: true,
            message: 'Producto eliminado del carrito',
            cartCount,
            total
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Vaciar carrito completo
 * DELETE /api/cart/clear
 */
async function clearSessionCart(req, res, next) {
    try {
        req.session.cart = [];
        // Mensaje flash de éxito
        req.flash('success', 'Carrito vaciado exitosamente');
        res.json({
            success: true,
            message: 'Carrito vaciado exitosamente',
            cartCount: 0,
            total: 0
        });
    }
    catch (error) {
        next(error);
    }
}
