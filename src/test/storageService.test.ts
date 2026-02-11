/**
 * Unit Tests for Storage Service
 * 
 * Tests specific examples, edge cases, and error conditions
 * for the StorageService class.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '@/services/storageService';
import { RegisteredUser, AuthToken, User } from '@/types/auth';

describe('StorageService', () => {
  // Clear storage before and after each test
  beforeEach(() => {
    StorageService.clearEverything();
  });
  
  afterEach(() => {
    StorageService.clearEverything();
  });
  
  describe('User Operations', () => {
    const mockUser: RegisteredUser = {
      id: '123',
      email: 'test@example.com',
      passwordHash: '$2a$10$hashedpassword',
      name: 'Test User',
      level: 'usuario',
      createdAt: new Date().toISOString()
    };
    
    it('should save and retrieve users', () => {
      const users = [mockUser];
      StorageService.saveUsers(users);
      
      const retrieved = StorageService.getUsers();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toEqual(mockUser);
    });
    
    it('should return empty array when no users exist', () => {
      const users = StorageService.getUsers();
      expect(users).toEqual([]);
    });
    
    it('should add a new user', () => {
      StorageService.addUser(mockUser);
      
      const users = StorageService.getUsers();
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(mockUser);
    });
    
    it('should find user by email (case-insensitive)', () => {
      StorageService.addUser(mockUser);
      
      const found1 = StorageService.findUserByEmail('test@example.com');
      const found2 = StorageService.findUserByEmail('TEST@EXAMPLE.COM');
      const found3 = StorageService.findUserByEmail('  test@example.com  ');
      
      expect(found1).toEqual(mockUser);
      expect(found2).toEqual(mockUser);
      expect(found3).toEqual(mockUser);
    });
    
    it('should return null when user not found by email', () => {
      StorageService.addUser(mockUser);
      
      const found = StorageService.findUserByEmail('notfound@example.com');
      expect(found).toBeNull();
    });
    
    it('should find user by ID', () => {
      StorageService.addUser(mockUser);
      
      const found = StorageService.findUserById('123');
      expect(found).toEqual(mockUser);
    });
    
    it('should return null when user not found by ID', () => {
      StorageService.addUser(mockUser);
      
      const found = StorageService.findUserById('999');
      expect(found).toBeNull();
    });
    
    it('should update existing user', () => {
      StorageService.addUser(mockUser);
      
      const updated = StorageService.updateUser('123', { name: 'Updated Name' });
      expect(updated).toBe(true);
      
      const user = StorageService.findUserById('123');
      expect(user?.name).toBe('Updated Name');
      expect(user?.email).toBe(mockUser.email); // Other fields unchanged
    });
    
    it('should return false when updating non-existent user', () => {
      const updated = StorageService.updateUser('999', { name: 'New Name' });
      expect(updated).toBe(false);
    });
    
    it('should delete existing user', () => {
      StorageService.addUser(mockUser);
      
      const deleted = StorageService.deleteUser('123');
      expect(deleted).toBe(true);
      
      const users = StorageService.getUsers();
      expect(users).toHaveLength(0);
    });
    
    it('should return false when deleting non-existent user', () => {
      const deleted = StorageService.deleteUser('999');
      expect(deleted).toBe(false);
    });
    
    it('should handle multiple users', () => {
      const user1: RegisteredUser = { ...mockUser, id: '1', email: 'user1@test.com' };
      const user2: RegisteredUser = { ...mockUser, id: '2', email: 'user2@test.com' };
      const user3: RegisteredUser = { ...mockUser, id: '3', email: 'user3@test.com' };
      
      StorageService.addUser(user1);
      StorageService.addUser(user2);
      StorageService.addUser(user3);
      
      const users = StorageService.getUsers();
      expect(users).toHaveLength(3);
      
      const found = StorageService.findUserByEmail('user2@test.com');
      expect(found?.id).toBe('2');
    });
  });
  
  describe('Token Operations', () => {
    const mockToken: AuthToken = {
      token: '123_1234567890_abc123',
      userId: '123',
      level: 'admin',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    it('should save and retrieve token', () => {
      StorageService.saveToken(mockToken);
      
      const retrieved = StorageService.getToken();
      expect(retrieved).toEqual(mockToken);
    });
    
    it('should return null when no token exists', () => {
      const token = StorageService.getToken();
      expect(token).toBeNull();
    });
    
    it('should clear token', () => {
      StorageService.saveToken(mockToken);
      StorageService.clearToken();
      
      const token = StorageService.getToken();
      expect(token).toBeNull();
    });
    
    it('should overwrite existing token', () => {
      const token1: AuthToken = { ...mockToken, userId: '1' };
      const token2: AuthToken = { ...mockToken, userId: '2' };
      
      StorageService.saveToken(token1);
      StorageService.saveToken(token2);
      
      const retrieved = StorageService.getToken();
      expect(retrieved?.userId).toBe('2');
    });
  });
  
  describe('Current User Operations', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      level: 'usuario'
    };
    
    it('should save and retrieve current user', () => {
      StorageService.saveCurrentUser(mockUser);
      
      const retrieved = StorageService.getCurrentUser();
      expect(retrieved).toEqual(mockUser);
    });
    
    it('should return null when no current user exists', () => {
      const user = StorageService.getCurrentUser();
      expect(user).toBeNull();
    });
    
    it('should clear current user', () => {
      StorageService.saveCurrentUser(mockUser);
      StorageService.clearCurrentUser();
      
      const user = StorageService.getCurrentUser();
      expect(user).toBeNull();
    });
    
    it('should overwrite existing current user', () => {
      const user1: User = { ...mockUser, id: '1' };
      const user2: User = { ...mockUser, id: '2' };
      
      StorageService.saveCurrentUser(user1);
      StorageService.saveCurrentUser(user2);
      
      const retrieved = StorageService.getCurrentUser();
      expect(retrieved?.id).toBe('2');
    });
  });
  
  describe('Clear Operations', () => {
    it('should clear all auth data but keep registered users', () => {
      const mockUser: RegisteredUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$10$hash',
        name: 'Test',
        level: 'usuario',
        createdAt: new Date().toISOString()
      };
      
      const mockToken: AuthToken = {
        token: 'token123',
        userId: '123',
        level: 'usuario',
        expiresAt: new Date().toISOString()
      };
      
      const mockCurrentUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test',
        level: 'usuario'
      };
      
      StorageService.addUser(mockUser);
      StorageService.saveToken(mockToken);
      StorageService.saveCurrentUser(mockCurrentUser);
      
      StorageService.clearAll();
      
      // Token and current user should be cleared
      expect(StorageService.getToken()).toBeNull();
      expect(StorageService.getCurrentUser()).toBeNull();
      
      // Registered users should remain
      expect(StorageService.getUsers()).toHaveLength(1);
    });
    
    it('should clear everything including registered users', () => {
      const mockUser: RegisteredUser = {
        id: '123',
        email: 'test@example.com',
        passwordHash: '$2a$10$hash',
        name: 'Test',
        level: 'usuario',
        createdAt: new Date().toISOString()
      };
      
      StorageService.addUser(mockUser);
      StorageService.clearEverything();
      
      expect(StorageService.getUsers()).toHaveLength(0);
      expect(StorageService.getToken()).toBeNull();
      expect(StorageService.getCurrentUser()).toBeNull();
    });
  });
  
  describe('Storage Availability', () => {
    it('should detect localStorage availability', () => {
      const available = StorageService.isAvailable();
      expect(available).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid JSON gracefully', () => {
      // Manually set invalid JSON
      localStorage.setItem('registeredUsers', 'invalid json');
      
      const users = StorageService.getUsers();
      expect(users).toEqual([]);
    });
    
    it('should handle corrupted token data', () => {
      localStorage.setItem('authToken', 'not valid json');
      
      const token = StorageService.getToken();
      expect(token).toBeNull();
    });
    
    it('should handle corrupted current user data', () => {
      localStorage.setItem('currentUser', '{invalid}');
      
      const user = StorageService.getCurrentUser();
      expect(user).toBeNull();
    });
  });
});
