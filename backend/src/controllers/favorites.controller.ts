/**
 * Controlador de Favoritos basado en Sesión
 * 
 * Maneja las operaciones de favoritos usando sesiones y cookies.
 * No requiere autenticación - funciona para usuarios anónimos.
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';

/**
 * Schema para operaciones de favoritos
 */
const favoriteSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido')
});

/**
 * Inicializar favoritos en sesión si no existe
 */
function initializeFavorites(req: Request): void {
  if (!req.session.favorites) {
    req.session.favorites = [];
  }
}

/**
 * Sincronizar favoritos desde cookies (para usuarios no autenticados)
 */
function syncFavoritesFromCookies(req: Request): void {
  initializeFavorites(req);
  
  // Si hay favoritos en cookies y la sesión está vacía, sincronizar
  if (req.cookies.favorites && req.session.favorites!.length === 0) {
    try {
      const cookieFavorites = JSON.parse(req.cookies.favorites);
      if (Array.isArray(cookieFavorites)) {
        req.session.favorites = cookieFavorites;
      }
    } catch (error) {
      // Ignorar errores de parsing
      console.error('Error parsing favorites cookie:', error);
    }
  }
}

/**
 * Guardar favoritos en cookies (para usuarios no autenticados)
 */
function saveFavoritesToCookies(res: Response, favorites: string[]): void {
  res.cookie('favorites', JSON.stringify(favorites), {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 año
    httpOnly: false, // Permitir acceso desde JavaScript del cliente
    sameSite: 'lax'
  });
}

/**
 * Agregar producto a favoritos
 * POST /api/favorites/add
 */
export async function addToFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = favoriteSchema.parse(req.body);
    syncFavoritesFromCookies(req);

    // Verificar que el producto existe
    const productRes = await query('SELECT id FROM products WHERE id = $1', [data.productId]);
    const product = productRes.rows[0];

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Verificar si ya está en favoritos
    if (!req.session.favorites!.includes(data.productId)) {
      req.session.favorites!.push(data.productId);
      
      // Guardar en cookies para usuarios no autenticados
      saveFavoritesToCookies(res, req.session.favorites!);
      
      // Mensaje flash de éxito
      req.flash('success', 'Producto agregado a favoritos');
    }

    res.json({
      success: true,
      message: 'Producto agregado a favoritos',
      favoritesCount: req.session.favorites!.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remover producto de favoritos
 * DELETE /api/favorites/remove
 */
export async function removeFromFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = favoriteSchema.parse(req.body);
    syncFavoritesFromCookies(req);

    // Buscar y eliminar el producto de favoritos
    const index = req.session.favorites!.indexOf(data.productId);
    
    if (index === -1) {
      throw new NotFoundError('Producto no encontrado en favoritos');
    }

    req.session.favorites!.splice(index, 1);
    
    // Actualizar cookies
    saveFavoritesToCookies(res, req.session.favorites!);

    // Mensaje flash de éxito
    req.flash('success', 'Producto eliminado de favoritos');

    res.json({
      success: true,
      message: 'Producto eliminado de favoritos',
      favoritesCount: req.session.favorites!.length
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener lista de favoritos
 * GET /api/favorites
 */
export async function getFavorites(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    syncFavoritesFromCookies(req);

    res.json({
      success: true,
      data: {
        favorites: req.session.favorites || [],
        count: req.session.favorites?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
}
