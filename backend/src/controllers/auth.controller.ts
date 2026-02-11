/**
 * Controlador de Autenticación
 * 
 * Maneja las operaciones de login y registro de usuarios.
 */

import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';
import { ValidationError, AuthenticationError, ConflictError } from '../utils/errors';

/**
 * Login de usuario
 * POST /api/auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validar datos
    const { email, password } = loginSchema.parse(req.body);

    // Buscar usuario en la base de datos
    const result = await query(`
      SELECT id, email, passwordHash, name, level 
      FROM users 
      WHERE email = $1
    `, [email]);

    // En Postgres, los resultados están en rows
    const user = result.rows[0];

    if (!user) {
      throw new AuthenticationError('Credenciales incorrectas');
    }

    // Verificar contraseña
    // Nota: en Postgres las columnas suelen devolverse en minúsculas, 
    // asegurarse de que passwordHash coincida con la definición de la tabla (creada como camelCase pero Postgres es case-insensitive por defecto a menos que se use comillas)
    // En initializeTables usamos passwordHash sin comillas, así que Postgres lo guardará como passwordhash (todo minúsculas)
    // Pero espera, better-sqlite3 devolvía camelCase si la query lo pedía.
    // Vamos a asumir que pg devuelve los nombres de columnas tal cual.
    // Ajuste: Postgres convierte nombres de columnas a minúsculas si no están entre comillas.
    // En initializeTables: passwordHash TEXT. -> passwordhash
    // En la query: SELECT ... passwordHash ... -> passwordhash
    // Vamos a acceder dinámicamente o usar el nombre correcto.

    // Para evitar problemas, usaremos acceso seguro
    const dbPassword = user.passwordhash || user.passwordHash;

    if (!dbPassword) {
      console.error("Error crítico: No se encuentra hash de contraseña", user);
      throw new AuthenticationError('Error interno de autenticación');
    }

    const isValidPassword = await comparePassword(password, dbPassword);

    if (!isValidPassword) {
      throw new AuthenticationError('Credenciales incorrectas');
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      level: user.level
    });

    // Responder con token y datos del usuario
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registro de usuario
 * POST /api/auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Validar datos
    const { name, email, password } = registerSchema.parse(req.body);

    // Verificar si el email ya existe
    const existingResult = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingResult.rows.length > 0) {
      throw new ConflictError('Este correo electrónico ya está registrado');
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const userId = `user-${Date.now()}`;
    const now = new Date().toISOString();

    await query(`
      INSERT INTO users (id, email, passwordHash, name, level, createdAt, updatedAt)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, email, passwordHash, name, 'usuario', now, now]);

    // Generar token
    const token = generateToken({
      userId,
      email,
      level: 'usuario'
    });

    // Responder con token y datos del usuario
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          email,
          name,
          level: 'usuario'
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/me
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AuthenticationError('No autenticado');
    }

    const result = await query(`
      SELECT id, email, name, level, createdAt 
      FROM users 
      WHERE id = $1
    `, [req.user.userId]);

    const user = result.rows[0];

    if (!user) {
      throw new AuthenticationError('Usuario no encontrado');
    }

    // Normalizar nombres de propiedades por si Postgres las devuelve en minúsculas
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level,
          createdAt: user.createdat || user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
