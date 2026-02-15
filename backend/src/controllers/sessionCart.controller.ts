/**
 * Controlador de Carrito basado en Sesión
 * 
 * Maneja las operaciones del carrito de compras usando sesiones.
 * No requiere autenticación - funciona para usuarios anónimos.
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { addToCartSchema, updateCartItemSchema } from '../schemas/cart.schemas';
import { NotFoundError, ConflictError } from '../utils/errors';

/**
 * Inicializar carrito en sesión si no existe
 */
function initializeCart(req: Request): void {
  if (!req.session.cart) {
    req.session.cart = [];
  }
}

/**
 * Calcular total del carrito
 */
async function calculateCartTotal(cartItems: Array<{ productId: string; quantity: number }>): Promise<{ total: number; cartCount: number }> {
  if (cartItems.length === 0) {
    return { total: 0, cartCount: 0 };
  }

  const productIds = cartItems.map(item => item.productId);
  const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
  
  const productsRes = await query(
    `SELECT id, price FROM products WHERE id IN (${placeholders})`,
    productIds
  );

  const products = productsRes.rows;
  let total = 0;
  let cartCount = 0;

  for (const item of cartItems) {
    const product = products.find((p: any) => p.id === item.productId);
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
export async function addToCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = addToCartSchema.parse(req.body);
    initializeCart(req);

    // Verificar que el producto existe
    const productRes = await query('SELECT * FROM products WHERE id = $1', [data.productId]);
    const product = productRes.rows[0];

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = req.session.cart!.findIndex(
      item => item.productId === data.productId
    );

    if (existingItemIndex !== -1) {
      // Actualizar cantidad existente
      const newQuantity = req.session.cart![existingItemIndex].quantity + data.quantity;

      // Verificar stock
      if (newQuantity > product.stock) {
        throw new ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      req.session.cart![existingItemIndex].quantity = newQuantity;
    } else {
      // Verificar stock
      if (data.quantity > product.stock) {
        throw new ConflictError(`Stock insuficiente. Disponible: ${product.stock}`);
      }

      // Agregar nuevo item
      req.session.cart!.push({
        productId: data.productId,
        quantity: data.quantity
      });
    }

    // Calcular total y contador
    const { total, cartCount } = await calculateCartTotal(req.session.cart!);

    // Mensaje flash de éxito
    req.flash('success', 'Producto agregado al carrito exitosamente');

    res.json({
      success: true,
      message: 'Producto agregado al carrito',
      cartCount,
      total
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar cantidad de un producto en el carrito
 * PUT /api/cart/update
 */
export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId } = req.body;
    const data = updateCartItemSchema.parse(req.body);
    initializeCart(req);

    if (!productId) {
      throw new NotFoundError('productId es requerido');
    }

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

    // Buscar item en el carrito
    const itemIndex = req.session.cart!.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Producto no encontrado en el carrito');
    }

    // Actualizar cantidad
    req.session.cart![itemIndex].quantity = data.quantity;

    // Calcular total y contador
    const { total, cartCount } = await calculateCartTotal(req.session.cart!);

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
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar producto del carrito
 * DELETE /api/cart/remove
 */
export async function removeFromCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { productId } = req.body;
    initializeCart(req);

    if (!productId) {
      throw new NotFoundError('productId es requerido');
    }

    // Buscar item en el carrito
    const itemIndex = req.session.cart!.findIndex(
      item => item.productId === productId
    );

    if (itemIndex === -1) {
      throw new NotFoundError('Producto no encontrado en el carrito');
    }

    // Eliminar item
    req.session.cart!.splice(itemIndex, 1);

    // Calcular total y contador
    const { total, cartCount } = await calculateCartTotal(req.session.cart!);

    // Mensaje flash de éxito
    req.flash('success', 'Producto eliminado del carrito');

    res.json({
      success: true,
      message: 'Producto eliminado del carrito',
      cartCount,
      total
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Vaciar carrito completo
 * DELETE /api/cart/clear
 */
export async function clearSessionCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
  } catch (error) {
    next(error);
  }
}
