import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funciones auxiliares para manejar usuarios en localStorage
const getRegisteredUsers = (): RegisteredUser[] => {
  try {
    const users = localStorage.getItem("registeredUsers");
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveRegisteredUsers = (users: RegisteredUser[]): void => {
  localStorage.setItem("registeredUsers", JSON.stringify(users));
};

const getCurrentUser = (): User | null => {
  try {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializar con el usuario guardado en localStorage
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  // Guardar el usuario actual cuando cambie
  useEffect(() => {
    saveCurrentUser(user);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Obtener usuarios registrados
    const registeredUsers = getRegisteredUsers();
    
    // Buscar usuario por email
    const foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Validar si el usuario existe
    if (!foundUser) {
      throw new Error("Usuario no encontrado. Por favor regístrate primero.");
    }
    
    // Validar contraseña
    if (foundUser.password !== password) {
      throw new Error("Contraseña incorrecta");
    }
    
    // Login exitoso
    const userSession: User = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
    };
    
    setUser(userSession);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulación de delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Obtener usuarios registrados
    const registeredUsers = getRegisteredUsers();
    
    // Validar si el email ya está registrado
    const emailExists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      throw new Error("Este correo electrónico ya está registrado");
    }
    
    // Crear nuevo usuario
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password,
      name,
      createdAt: new Date().toISOString(),
    };
    
    // Guardar usuario
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);
    
    // Iniciar sesión automáticamente
    const userSession: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    
    setUser(userSession);
    return true;
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
