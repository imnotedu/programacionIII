/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Integrates with backend API for login, register, and session management.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authApi from '@/services/authApiService';

interface User {
  id: string;
  email: string;
  name: string;
  level: 'admin' | 'usuario';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authApi.getCurrentUser();
      const currentToken = localStorage.getItem('token');
      
      if (currentUser && currentToken) {
        setUser(currentUser);
        setToken(currentToken);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await authApi.login(credentials);
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await authApi.register(data);
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
  };

  const isAdmin = () => {
    return user?.level === 'admin';
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
