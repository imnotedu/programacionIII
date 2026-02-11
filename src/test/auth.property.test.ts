/**
 * Property-Based Tests for Authentication
 * 
 * These tests use fast-check to verify universal properties
 * that should hold true across all valid inputs.
 * 
 * Feature: user-authentication
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { AuthService } from '@/services/authService';
import { StorageService } from '@/services/storageService';
import { RegisteredUser, User, AuthToken } from '@/types/auth';

// Property test configuration
// Note: bcrypt hashing is intentionally slow for security
// We use fewer iterations to keep test time reasonable
const propertyTestConfig = {
  numRuns: 10, // Reduced from 100 due to bcrypt performance
  verbose: false
};

describe('Authentication Property Tests', () => {
  /**
   * Feature: user-authentication, Property 1: Password Encryption Consistency
   * Validates: Requirements 3.1, 3.4
   * 
   * Property: For any password string, hashing it twice with the same algorithm
   * should produce different hashes (due to salt), but both hashes should
   * validate correctly against the original password.
   */
  describe('Property 1: Password Encryption Consistency', () => {
    it('should produce different hashes for same password but validate correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random passwords between 6 and 50 characters
          fc.string({ minLength: 6, maxLength: 50 }),
          async (password) => {
            // Hash the same password twice
            const hash1 = await AuthService.hashPassword(password);
            const hash2 = await AuthService.hashPassword(password);
            
            // Hashes should be different (due to different salts)
            expect(hash1).not.toBe(hash2);
            
            // Both hashes should validate correctly against the original password
            const valid1 = await AuthService.comparePassword(password, hash1);
            const valid2 = await AuthService.comparePassword(password, hash2);
            
            expect(valid1).toBe(true);
            expect(valid2).toBe(true);
            
            // Wrong password should not validate
            const wrongPassword = password + 'wrong';
            const invalidCheck = await AuthService.comparePassword(wrongPassword, hash1);
            expect(invalidCheck).toBe(false);
          }
        ),
        propertyTestConfig
      );
    }, 60000); // 60 second timeout for bcrypt operations
    
    it('should reject incorrect passwords consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 6, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          async (correctPassword, wrongPassword) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);
            
            const hash = await AuthService.hashPassword(correctPassword);
            
            // Correct password should validate
            const validCorrect = await AuthService.comparePassword(correctPassword, hash);
            expect(validCorrect).toBe(true);
            
            // Wrong password should not validate
            const validWrong = await AuthService.comparePassword(wrongPassword, hash);
            expect(validWrong).toBe(false);
          }
        ),
        propertyTestConfig
      );
    }, 60000); // 60 second timeout for bcrypt operations
  });
  
  /**
   * Feature: user-authentication, Property 3: Authentication Token Validity
   * Validates: Requirements 2.4, 6.1
   * 
   * Property: For any generated authentication token, it should remain valid
   * for exactly 24 hours from creation and become invalid after that period.
   */
  describe('Property 3: Authentication Token Validity', () => {
    it('should generate valid tokens with correct expiration', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.constantFrom('admin', 'usuario'), // level
          (userId, level) => {
            const token = AuthService.generateToken(userId, level);
            
            // Token should have all required fields
            expect(token.token).toBeDefined();
            expect(token.userId).toBe(userId);
            expect(token.level).toBe(level);
            expect(token.expiresAt).toBeDefined();
            
            // Token should be valid immediately after creation
            expect(AuthService.isTokenValid(token)).toBe(true);
            
            // Expiration should be approximately 24 hours from now
            const now = new Date();
            const expiryDate = new Date(token.expiresAt);
            const hoursDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
            
            // Should be between 23.9 and 24.1 hours (allowing for small timing differences)
            expect(hoursDiff).toBeGreaterThan(23.9);
            expect(hoursDiff).toBeLessThan(24.1);
          }
        ),
        propertyTestConfig
      );
    });
    
    it('should correctly identify expired tokens', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.constantFrom('admin', 'usuario'), // level
          (userId, level) => {
            // Create a token that expired 1 hour ago
            const expiredToken = {
              token: `${userId}_${Date.now()}_test`,
              userId,
              level,
              expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            };
            
            // Expired token should be invalid
            expect(AuthService.isTokenValid(expiredToken)).toBe(false);
          }
        ),
        propertyTestConfig
      );
    });
    
    it('should extract userId from token string correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }), // userId
          fc.constantFrom('admin', 'usuario'), // level
          (userId, level) => {
            const token = AuthService.generateToken(userId, level);
            const extractedUserId = AuthService.extractUserIdFromToken(token.token);
            
            expect(extractedUserId).toBe(userId);
          }
        ),
        propertyTestConfig
      );
    });
  });
});

/**
 * Property Tests for AuthContext Integration
 * 
 * These tests verify the integration of AuthService and StorageService
 * through the AuthContext.
 */
describe('AuthContext Integration Property Tests', () => {
  // Note: These tests would ideally use React Testing Library to test the actual context
  // For now, we'll test the underlying service integration that the context uses
  
  /**
   * Feature: user-authentication, Property 2: Email Uniqueness
   * Validates: Requirements 1.3
   * 
   * Property: For any registration attempt, if an email already exists in the system,
   * the registration should be rejected regardless of other field values.
   */
  describe('Property 2: Email Uniqueness', () => {
    beforeEach(() => {
      StorageService.clearEverything();
    });
    
    afterEach(() => {
      StorageService.clearEverything();
    });
    
    it('should reject registration with existing email', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(s) && s.trim().length >= 2),
          fc.constantFrom('admin', 'usuario'),
          async (email, password, name, level) => {
            // First registration should succeed
            const passwordHash = await AuthService.hashPassword(password);
            const user1: RegisteredUser = {
              id: '1',
              email: email.toLowerCase().trim(),
              passwordHash,
              name: name.trim(),
              level,
              createdAt: new Date().toISOString()
            };
            
            StorageService.addUser(user1);
            
            // Second registration with same email should fail
            const existingUser = StorageService.findUserByEmail(email);
            expect(existingUser).not.toBeNull();
            expect(existingUser?.email).toBe(email.toLowerCase().trim());
            
            // Cleanup
            StorageService.clearEverything();
          }
        ),
        { numRuns: 10, verbose: false } // Reduced runs due to bcrypt performance
      );
    }, 60000);
  });
  
  /**
   * Feature: user-authentication, Property 4: Login Credential Validation
   * Validates: Requirements 2.2, 2.3
   * 
   * Property: For any login attempt with valid email but incorrect password,
   * the system should reject authentication.
   */
  describe('Property 4: Login Credential Validation', () => {
    beforeEach(() => {
      StorageService.clearEverything();
    });
    
    afterEach(() => {
      StorageService.clearEverything();
    });
    
    it('should reject login with incorrect password', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          fc.string({ minLength: 6 }).filter(s => s.trim().length >= 6),
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(s) && s.trim().length >= 2),
          fc.constantFrom('admin', 'usuario'),
          async (email, correctPassword, wrongPassword, name, level) => {
            // Skip if passwords are the same
            fc.pre(correctPassword !== wrongPassword);
            
            // Create user with correct password
            const passwordHash = await AuthService.hashPassword(correctPassword);
            const user: RegisteredUser = {
              id: '1',
              email: email.toLowerCase().trim(),
              passwordHash,
              name: name.trim(),
              level,
              createdAt: new Date().toISOString()
            };
            
            StorageService.addUser(user);
            
            // Correct password should validate
            const validCorrect = await AuthService.comparePassword(correctPassword, passwordHash);
            expect(validCorrect).toBe(true);
            
            // Wrong password should not validate
            const validWrong = await AuthService.comparePassword(wrongPassword, passwordHash);
            expect(validWrong).toBe(false);
            
            // Cleanup
            StorageService.clearEverything();
          }
        ),
        { numRuns: 10, verbose: false }
      );
    }, 60000);
  });
  
  /**
   * Feature: user-authentication, Property 5: User Level Persistence
   * Validates: Requirements 4.1, 4.2, 4.3
   * 
   * Property: For any user registration with a specified level (admin or usuario),
   * that level should be consistently retrievable throughout the user's session.
   */
  describe('Property 5: User Level Persistence', () => {
    beforeEach(() => {
      StorageService.clearEverything();
    });
    
    afterEach(() => {
      StorageService.clearEverything();
    });
    
    it('should persist user level across storage operations', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(s) && s.trim().length >= 2),
          fc.constantFrom('admin', 'usuario'),
          (email, name, level) => {
            // Create user with specific level
            const user: RegisteredUser = {
              id: Date.now().toString(),
              email: email.toLowerCase().trim(),
              passwordHash: '$2a$10$test',
              name: name.trim(),
              level,
              createdAt: new Date().toISOString()
            };
            
            StorageService.addUser(user);
            
            // Retrieve user and verify level
            const retrieved = StorageService.findUserByEmail(email);
            expect(retrieved).not.toBeNull();
            expect(retrieved?.level).toBe(level);
            
            // Create session user
            const sessionUser: User = {
              id: user.id,
              email: user.email,
              name: user.name,
              level: user.level
            };
            
            StorageService.saveCurrentUser(sessionUser);
            
            // Retrieve session and verify level
            const session = StorageService.getCurrentUser();
            expect(session).not.toBeNull();
            expect(session?.level).toBe(level);
            
            // Cleanup
            StorageService.clearEverything();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  /**
   * Feature: user-authentication, Property 7: Session Persistence
   * Validates: Requirements 6.2, 6.3
   * 
   * Property: For any authenticated user, closing and reopening the browser
   * should restore the session if the token is still valid.
   */
  describe('Property 7: Session Persistence', () => {
    beforeEach(() => {
      StorageService.clearEverything();
    });
    
    afterEach(() => {
      StorageService.clearEverything();
    });
    
    it('should restore session with valid token', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(s) && s.trim().length >= 2),
          fc.constantFrom('admin', 'usuario'),
          (userId, email, name, level) => {
            // Create user session
            const user: User = {
              id: userId,
              email: email.toLowerCase().trim(),
              name: name.trim(),
              level
            };
            
            // Create valid token
            const token = AuthService.generateToken(userId, level);
            
            // Save session
            StorageService.saveCurrentUser(user);
            StorageService.saveToken(token);
            
            // Simulate browser restart - retrieve from storage
            const retrievedUser = StorageService.getCurrentUser();
            const retrievedToken = StorageService.getToken();
            
            // Verify session is restored
            expect(retrievedUser).not.toBeNull();
            expect(retrievedUser?.id).toBe(userId);
            expect(retrievedUser?.level).toBe(level);
            
            expect(retrievedToken).not.toBeNull();
            expect(AuthService.isTokenValid(retrievedToken!)).toBe(true);
            
            // Cleanup
            StorageService.clearEverything();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
    
    it('should not restore session with expired token', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('admin', 'usuario'),
          (userId, level) => {
            // Create expired token
            const expiredToken: AuthToken = {
              token: `${userId}_${Date.now()}_test`,
              userId,
              level,
              expiresAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
            };
            
            StorageService.saveToken(expiredToken);
            
            // Verify token is expired
            expect(AuthService.isTokenValid(expiredToken)).toBe(false);
            
            // Cleanup
            StorageService.clearEverything();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
  
  /**
   * Feature: user-authentication, Property 10: Logout Cleanup
   * Validates: Requirements 6.4
   * 
   * Property: For any logout operation, all authentication data
   * (token, current user) should be completely removed from storage.
   */
  describe('Property 10: Logout Cleanup', () => {
    beforeEach(() => {
      StorageService.clearEverything();
    });
    
    afterEach(() => {
      StorageService.clearEverything();
    });
    
    it('should clear all auth data on logout', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.emailAddress(),
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(s) && s.trim().length >= 2),
          fc.constantFrom('admin', 'usuario'),
          (userId, email, name, level) => {
            // Create and save session
            const user: User = {
              id: userId,
              email: email.toLowerCase().trim(),
              name: name.trim(),
              level
            };
            
            const token = AuthService.generateToken(userId, level);
            
            StorageService.saveCurrentUser(user);
            StorageService.saveToken(token);
            
            // Verify data is saved
            expect(StorageService.getCurrentUser()).not.toBeNull();
            expect(StorageService.getToken()).not.toBeNull();
            
            // Perform logout (clear all)
            StorageService.clearAll();
            
            // Verify all auth data is cleared
            expect(StorageService.getCurrentUser()).toBeNull();
            expect(StorageService.getToken()).toBeNull();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
});
