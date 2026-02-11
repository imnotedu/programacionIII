/**
 * Storage Service
 * 
 * Provides localStorage operations for authentication data including:
 * - User management (CRUD operations)
 * - Token management
 * - Current user session management
 * 
 * This service abstracts localStorage operations and provides error handling.
 */

import { RegisteredUser, AuthToken, User } from '@/types/auth';

/**
 * StorageService class - handles all localStorage operations for authentication
 */
export class StorageService {
  // Storage keys
  private static readonly USERS_KEY = 'registeredUsers';
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly CURRENT_USER_KEY = 'currentUser';
  
  /**
   * Get all registered users from localStorage
   * 
   * @returns Array of registered users, empty array if none exist or on error
   * 
   * @example
   * const users = StorageService.getUsers();
   * // Returns: RegisteredUser[]
   */
  static getUsers(): RegisteredUser[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading users from storage:', error);
      return [];
    }
  }
  
  /**
   * Save users array to localStorage
   * 
   * @param users - Array of registered users to save
   * 
   * @example
   * StorageService.saveUsers([user1, user2]);
   */
  static saveUsers(users: RegisteredUser[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to storage:', error);
      throw new Error('No se pudo guardar los usuarios');
    }
  }
  
  /**
   * Find a user by email address (case-insensitive)
   * 
   * @param email - Email address to search for
   * @returns RegisteredUser if found, null otherwise
   * 
   * @example
   * const user = StorageService.findUserByEmail('test@example.com');
   * // Returns: RegisteredUser | null
   */
  static findUserByEmail(email: string): RegisteredUser | null {
    try {
      const users = this.getUsers();
      const normalizedEmail = email.toLowerCase().trim();
      return users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }
  
  /**
   * Find a user by ID
   * 
   * @param userId - User ID to search for
   * @returns RegisteredUser if found, null otherwise
   * 
   * @example
   * const user = StorageService.findUserById('123');
   * // Returns: RegisteredUser | null
   */
  static findUserById(userId: string): RegisteredUser | null {
    try {
      const users = this.getUsers();
      return users.find(u => u.id === userId) || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }
  
  /**
   * Add a new user to storage
   * 
   * @param user - RegisteredUser to add
   * 
   * @example
   * StorageService.addUser(newUser);
   */
  static addUser(user: RegisteredUser): void {
    try {
      const users = this.getUsers();
      users.push(user);
      this.saveUsers(users);
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error('No se pudo agregar el usuario');
    }
  }
  
  /**
   * Update an existing user in storage
   * 
   * @param userId - ID of user to update
   * @param updates - Partial user data to update
   * @returns true if user was updated, false if not found
   * 
   * @example
   * StorageService.updateUser('123', { name: 'New Name' });
   */
  static updateUser(userId: string, updates: Partial<RegisteredUser>): boolean {
    try {
      const users = this.getUsers();
      const index = users.findIndex(u => u.id === userId);
      
      if (index === -1) return false;
      
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('No se pudo actualizar el usuario');
    }
  }
  
  /**
   * Delete a user from storage
   * 
   * @param userId - ID of user to delete
   * @returns true if user was deleted, false if not found
   * 
   * @example
   * StorageService.deleteUser('123');
   */
  static deleteUser(userId: string): boolean {
    try {
      const users = this.getUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      
      if (filteredUsers.length === users.length) return false;
      
      this.saveUsers(filteredUsers);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('No se pudo eliminar el usuario');
    }
  }
  
  /**
   * Get the current authentication token
   * 
   * @returns AuthToken if exists, null otherwise
   * 
   * @example
   * const token = StorageService.getToken();
   * // Returns: AuthToken | null
   */
  static getToken(): AuthToken | null {
    try {
      const data = localStorage.getItem(this.TOKEN_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading token from storage:', error);
      return null;
    }
  }
  
  /**
   * Save authentication token to storage
   * 
   * @param token - AuthToken to save
   * 
   * @example
   * StorageService.saveToken(authToken);
   */
  static saveToken(token: AuthToken): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
    } catch (error) {
      console.error('Error saving token to storage:', error);
      throw new Error('No se pudo guardar el token');
    }
  }
  
  /**
   * Clear authentication token from storage
   * 
   * @example
   * StorageService.clearToken();
   */
  static clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token from storage:', error);
    }
  }
  
  /**
   * Get the current user session
   * 
   * @returns User if exists, null otherwise
   * 
   * @example
   * const user = StorageService.getCurrentUser();
   * // Returns: User | null
   */
  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading current user from storage:', error);
      return null;
    }
  }
  
  /**
   * Save current user session to storage
   * 
   * @param user - User to save
   * 
   * @example
   * StorageService.saveCurrentUser(user);
   */
  static saveCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving current user to storage:', error);
      throw new Error('No se pudo guardar el usuario actual');
    }
  }
  
  /**
   * Clear current user session from storage
   * 
   * @example
   * StorageService.clearCurrentUser();
   */
  static clearCurrentUser(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error clearing current user from storage:', error);
    }
  }
  
  /**
   * Clear all authentication data from storage
   * This includes token and current user, but NOT registered users
   * 
   * @example
   * StorageService.clearAll();
   */
  static clearAll(): void {
    this.clearToken();
    this.clearCurrentUser();
  }
  
  /**
   * Clear everything including registered users (use with caution!)
   * This is useful for testing or complete reset
   * 
   * @example
   * StorageService.clearEverything();
   */
  static clearEverything(): void {
    try {
      localStorage.removeItem(this.USERS_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }
  
  /**
   * Check if localStorage is available
   * 
   * @returns true if localStorage is available, false otherwise
   * 
   * @example
   * if (StorageService.isAvailable()) {
   *   // Use storage
   * }
   */
  static isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
