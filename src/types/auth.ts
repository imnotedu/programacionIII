/**
 * Authentication Type Definitions
 * 
 * This file contains all TypeScript types and interfaces related to
 * user authentication, including user data, tokens, and credentials.
 */

/**
 * User level type - defines the two types of users in the system
 */
export type UserLevel = 'admin' | 'usuario';

/**
 * User interface - represents an authenticated user session
 */
export interface User {
  id: string;
  email: string;
  name: string;
  level: UserLevel;
}

/**
 * RegisteredUser interface - represents a user stored in the database
 * Includes password hash instead of plain password for security
 */
export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  level: UserLevel;
  createdAt: string;
}

/**
 * AuthToken interface - represents an authentication token
 * Tokens are used to maintain user sessions
 */
export interface AuthToken {
  token: string;
  userId: string;
  level: UserLevel;
  expiresAt: string;
}

/**
 * LoginCredentials interface - data required for user login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * RegisterData interface - data required for user registration
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  level: UserLevel;
}

/**
 * AuthContextType interface - defines the shape of the Auth Context
 * This is used by components to access authentication state and methods
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

/**
 * AuthFormData interface - legacy interface for form data
 * Kept for backwards compatibility with existing code
 */
export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  level?: UserLevel;
}
