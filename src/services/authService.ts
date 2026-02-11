/**
 * Authentication Service
 * 
 * Provides core authentication functionality including:
 * - Password hashing and comparison using bcrypt
 * - Token generation and validation
 * - Security utilities
 */

import bcrypt from 'bcryptjs';
import { AuthToken, UserLevel } from '@/types/auth';

/**
 * AuthService class - handles all authentication-related operations
 */
export class AuthService {
  /**
   * Number of salt rounds for bcrypt hashing
   * Higher values = more secure but slower
   * 10 rounds is a good balance for web applications
   */
  private static readonly SALT_ROUNDS = 10;
  
  /**
   * Token expiry time in hours
   */
  private static readonly TOKEN_EXPIRY_HOURS = 24;
  
  /**
   * Hash a password using bcrypt
   * 
   * @param password - Plain text password to hash
   * @returns Promise resolving to the hashed password
   * 
   * @example
   * const hash = await AuthService.hashPassword('myPassword123');
   * // Returns: $2a$10$...
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      throw new Error('Error al encriptar la contraseña');
    }
  }
  
  /**
   * Compare a plain text password with a hashed password
   * 
   * @param password - Plain text password to check
   * @param hash - Hashed password to compare against
   * @returns Promise resolving to true if passwords match, false otherwise
   * 
   * @example
   * const isValid = await AuthService.comparePassword('myPassword123', hash);
   * // Returns: true or false
   */
  static async comparePassword(
    password: string, 
    hash: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Error al verificar la contraseña');
    }
  }
  
  /**
   * Generate a simple authentication token
   * 
   * Token format: {userId}_{timestamp}_{random}
   * This is a simple token for demonstration purposes.
   * In production, use JWT or similar secure token standards.
   * 
   * @param userId - ID of the user
   * @param level - User level (admin or usuario)
   * @returns AuthToken object with token, userId, level, and expiration
   * 
   * @example
   * const token = AuthService.generateToken('123', 'admin');
   * // Returns: { token: '123_1234567890_abc123', userId: '123', level: 'admin', expiresAt: '...' }
   */
  static generateToken(userId: string, level: UserLevel): AuthToken {
    // Generate a simple token using userId, timestamp, and random string
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const token = `${userId}_${timestamp}_${randomPart}`;
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);
    
    return {
      token,
      userId,
      level,
      expiresAt: expiresAt.toISOString()
    };
  }
  
  /**
   * Check if a token is still valid (not expired)
   * 
   * @param token - AuthToken object to validate
   * @returns true if token is valid, false if expired
   * 
   * @example
   * const isValid = AuthService.isTokenValid(token);
   * // Returns: true or false
   */
  static isTokenValid(token: AuthToken): boolean {
    const now = new Date();
    const expiryDate = new Date(token.expiresAt);
    return expiryDate > now;
  }
  
  /**
   * Extract user ID from a token string
   * 
   * Token format: {userId}_{timestamp}_{random}
   * Note: userId can contain underscores, so we need to be careful with parsing
   * 
   * @param tokenString - Token string in format {userId}_{timestamp}_{random}
   * @returns User ID or null if token format is invalid
   * 
   * @example
   * const userId = AuthService.extractUserIdFromToken('123_1234567890_abc123');
   * // Returns: '123'
   */
  static extractUserIdFromToken(tokenString: string): string | null {
    try {
      const parts = tokenString.split('_');
      if (parts.length < 3) return null;
      
      // The last two parts are timestamp and random
      // Everything before that is the userId (which may contain underscores)
      const userId = parts.slice(0, -2).join('_');
      return userId || null;
    } catch {
      return null;
    }
  }
}
