# Design Document: User Authentication

## Overview

El sistema de autenticación de usuarios para Fitness Fuel Store proporciona funcionalidades completas de registro, login y gestión de sesiones. El diseño se basa en una arquitectura React con Context API para el manejo de estado global, localStorage para persistencia de datos, y TypeScript para type safety.

El sistema actual ya tiene una implementación básica que necesita ser mejorada para cumplir con los requisitos del profesor, específicamente:
- Agregar campo de nivel de usuario (admin/usuario)
- Implementar encriptación de contraseñas con bcrypt
- Generar tokens simples de autenticación
- Mejorar validaciones según los requisitos

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Login      │    │   Register   │    │  Protected   │  │
│  │   Page       │    │   Page       │    │   Routes     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                    │                    │          │
│         └────────────────────┼────────────────────┘          │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │   AuthContext     │                    │
│                    │   (State Mgmt)    │                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │   Auth Service    │                    │
│                    │   (Business Logic)│                    │
│                    └─────────┬─────────┘                    │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │   Storage Layer   │                    │
│                    │   (localStorage)  │                    │
│                    └───────────────────┘                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend Framework**: React 18 con TypeScript
- **State Management**: React Context API
- **Routing**: React Router DOM v6
- **Form Handling**: React Hook Form con Zod validation
- **UI Components**: Radix UI + Tailwind CSS
- **Password Hashing**: bcryptjs (browser-compatible)
- **Storage**: localStorage (simulación de base de datos)
- **Testing**: Vitest + React Testing Library

## Components and Interfaces

### 1. Type Definitions

```typescript
// src/types/auth.ts

export interface User {
  id: string;
  email: string;
  name: string;
  level: UserLevel;
}

export type UserLevel = 'admin' | 'usuario';

export interface RegisteredUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  level: UserLevel;
  createdAt: string;
}

export interface AuthToken {
  token: string;
  userId: string;
  level: UserLevel;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  level: UserLevel;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}
```

### 2. Authentication Service

```typescript
// src/services/authService.ts

import bcrypt from 'bcryptjs';

export class AuthService {
  private static readonly SALT_ROUNDS = 10;
  private static readonly TOKEN_EXPIRY_HOURS = 24;
  
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  // Compare password with hash
  static async comparePassword(
    password: string, 
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  // Generate simple token
  static generateToken(userId: string, level: UserLevel): AuthToken {
    const token = `${userId}_${Date.now()}_${Math.random().toString(36)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRY_HOURS);
    
    return {
      token,
      userId,
      level,
      expiresAt: expiresAt.toISOString()
    };
  }
  
  // Validate token expiry
  static isTokenValid(token: AuthToken): boolean {
    return new Date(token.expiresAt) > new Date();
  }
}
```

### 3. Storage Service

```typescript
// src/services/storageService.ts

export class StorageService {
  private static readonly USERS_KEY = 'registeredUsers';
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly CURRENT_USER_KEY = 'currentUser';
  
  // User operations
  static getUsers(): RegisteredUser[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
  
  static saveUsers(users: RegisteredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
  
  static findUserByEmail(email: string): RegisteredUser | null {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
  
  static addUser(user: RegisteredUser): void {
    const users = this.getUsers();
    users.push(user);
    this.saveUsers(users);
  }
  
  // Token operations
  static getToken(): AuthToken | null {
    try {
      const data = localStorage.getItem(this.TOKEN_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  static saveToken(token: AuthToken): void {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(token));
  }
  
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  // Current user operations
  static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
  
  static saveCurrentUser(user: User): void {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }
  
  static clearCurrentUser(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
  
  static clearAll(): void {
    this.clearToken();
    this.clearCurrentUser();
  }
}
```

### 4. Auth Context

```typescript
// src/context/AuthContext.tsx

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => 
    StorageService.getCurrentUser()
  );
  const [token, setToken] = useState<string | null>(() => {
    const authToken = StorageService.getToken();
    if (authToken && AuthService.isTokenValid(authToken)) {
      return authToken.token;
    }
    return null;
  });
  
  const login = async (credentials: LoginCredentials): Promise<void> => {
    // Validate input
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }
    
    // Find user
    const registeredUser = StorageService.findUserByEmail(credentials.email);
    if (!registeredUser) {
      throw new Error('Usuario no encontrado');
    }
    
    // Verify password
    const isValid = await AuthService.comparePassword(
      credentials.password,
      registeredUser.passwordHash
    );
    
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }
    
    // Generate token
    const authToken = AuthService.generateToken(
      registeredUser.id,
      registeredUser.level
    );
    
    // Create user session
    const userSession: User = {
      id: registeredUser.id,
      email: registeredUser.email,
      name: registeredUser.name,
      level: registeredUser.level
    };
    
    // Save to storage
    StorageService.saveToken(authToken);
    StorageService.saveCurrentUser(userSession);
    
    // Update state
    setUser(userSession);
    setToken(authToken.token);
  };
  
  const register = async (data: RegisterData): Promise<void> => {
    // Validate input
    if (!data.email || !data.password || !data.name) {
      throw new Error('Todos los campos son requeridos');
    }
    
    // Check if email exists
    const existingUser = StorageService.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('Este correo electrónico ya está registrado');
    }
    
    // Hash password
    const passwordHash = await AuthService.hashPassword(data.password);
    
    // Create new user
    const newUser: RegisteredUser = {
      id: Date.now().toString(),
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      level: data.level,
      createdAt: new Date().toISOString()
    };
    
    // Save user
    StorageService.addUser(newUser);
    
    // Auto-login
    await login({ email: data.email, password: data.password });
  };
  
  const logout = (): void => {
    StorageService.clearAll();
    setUser(null);
    setToken(null);
  };
  
  const isAdmin = (): boolean => {
    return user?.level === 'admin';
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

### 5. Form Validation Schemas

```typescript
// src/schemas/authSchemas.ts

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras'),
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Formato de correo electrónico inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Debes confirmar la contraseña'),
  level: z.enum(['admin', 'usuario'], {
    required_error: 'Debes seleccionar un nivel de usuario'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});
```

### 6. UI Components

#### Login Page
- Email input field with validation
- Password input field with show/hide toggle
- Submit button with loading state
- Link to registration page
- Error message display
- Responsive design

#### Register Page
- Name input field with validation
- Email input field with validation
- Password input field with strength indicator
- Confirm password field
- User level selector (radio buttons: admin/usuario)
- Submit button with loading state
- Link to login page
- Error message display
- Responsive design

#### Protected Route Component
- Checks authentication status
- Redirects to login if not authenticated
- Optionally checks admin level for admin-only routes
- Preserves intended destination for post-login redirect

## Data Models

### Database Schema (localStorage simulation)

```typescript
// registeredUsers: RegisteredUser[]
[
  {
    id: "1234567890",
    email: "user@example.com",
    passwordHash: "$2a$10$...", // bcrypt hash
    name: "Juan Pérez",
    level: "usuario",
    createdAt: "2024-01-15T10:30:00.000Z"
  }
]

// authToken: AuthToken
{
  token: "1234567890_1705318200000_abc123",
  userId: "1234567890",
  level: "usuario",
  expiresAt: "2024-01-16T10:30:00.000Z"
}

// currentUser: User
{
  id: "1234567890",
  email: "user@example.com",
  name: "Juan Pérez",
  level: "usuario"
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password Encryption Consistency
*For any* password string, hashing it twice with the same algorithm should produce different hashes (due to salt), but both hashes should validate correctly against the original password.

**Validates: Requirements 3.1, 3.4**

### Property 2: Email Uniqueness
*For any* registration attempt, if an email already exists in the system, the registration should be rejected regardless of other field values.

**Validates: Requirements 1.3**

### Property 3: Authentication Token Validity
*For any* generated authentication token, it should remain valid for exactly 24 hours from creation and become invalid after that period.

**Validates: Requirements 2.4, 6.1**

### Property 4: Login Credential Validation
*For any* login attempt with valid email but incorrect password, the system should reject authentication and not reveal whether the email exists.

**Validates: Requirements 2.2, 2.3**

### Property 5: User Level Persistence
*For any* user registration with a specified level (admin or usuario), that level should be consistently retrievable throughout the user's session and across sessions.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 6: Form Validation Completeness
*For any* form submission with invalid data, all validation errors should be collected and displayed before any server-side operation is attempted.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 7: Session Persistence
*For any* authenticated user, closing and reopening the browser should restore the session if the token is still valid.

**Validates: Requirements 6.2, 6.3**

### Property 8: Password Minimum Length
*For any* password input during registration or login, passwords shorter than 6 characters should be rejected with a clear error message.

**Validates: Requirements 1.6, 5.3**

### Property 9: Email Format Validation
*For any* email input, strings that don't match the standard email format (user@domain.extension) should be rejected.

**Validates: Requirements 1.5, 5.2**

### Property 10: Logout Cleanup
*For any* logout operation, all authentication data (token, current user) should be completely removed from storage.

**Validates: Requirements 6.4**

## Error Handling

### Error Categories

1. **Validation Errors**
   - Empty required fields
   - Invalid email format
   - Password too short
   - Passwords don't match
   - Invalid user level

2. **Authentication Errors**
   - User not found
   - Incorrect password
   - Email already registered
   - Token expired

3. **System Errors**
   - localStorage unavailable
   - Bcrypt hashing failure
   - JSON parse errors

### Error Handling Strategy

```typescript
// Centralized error handler
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Error codes
export enum AuthErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

// Usage in components
try {
  await login(credentials);
} catch (error) {
  if (error instanceof AuthError) {
    // Handle specific auth errors
    toast({
      title: 'Error de autenticación',
      description: error.message,
      variant: 'destructive'
    });
  } else {
    // Handle unexpected errors
    toast({
      title: 'Error',
      description: 'Ocurrió un error inesperado',
      variant: 'destructive'
    });
  }
}
```

## Testing Strategy

### Dual Testing Approach

The authentication system will be tested using both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs
- Both approaches are complementary and necessary for comprehensive coverage

### Unit Testing

Unit tests focus on:
- Specific user registration scenarios
- Login with known credentials
- Password hashing with specific inputs
- Token generation and validation
- Error handling for specific cases
- UI component rendering and interactions

Example unit tests:
```typescript
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const password = 'Test123!';
    const hash = await AuthService.hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });
  
  it('should reject login with wrong password', async () => {
    await expect(
      login({ email: 'test@test.com', password: 'wrong' })
    ).rejects.toThrow('Contraseña incorrecta');
  });
});
```

### Property-Based Testing

Property tests will use **fast-check** library for TypeScript/JavaScript. Each test will run a minimum of 100 iterations with randomized inputs.

Configuration:
```typescript
import fc from 'fast-check';

// Configure property tests
const propertyTestConfig = {
  numRuns: 100,
  verbose: true
};
```

Property test examples:
```typescript
// Feature: user-authentication, Property 1: Password Encryption Consistency
describe('Property: Password Encryption Consistency', () => {
  it('should produce different hashes for same password but validate correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 6, maxLength: 50 }),
        async (password) => {
          const hash1 = await AuthService.hashPassword(password);
          const hash2 = await AuthService.hashPassword(password);
          
          // Hashes should be different (due to salt)
          expect(hash1).not.toBe(hash2);
          
          // Both should validate correctly
          const valid1 = await AuthService.comparePassword(password, hash1);
          const valid2 = await AuthService.comparePassword(password, hash2);
          
          expect(valid1).toBe(true);
          expect(valid2).toBe(true);
        }
      ),
      propertyTestConfig
    );
  });
});

// Feature: user-authentication, Property 2: Email Uniqueness
describe('Property: Email Uniqueness', () => {
  it('should reject registration with existing email', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 6 }),
        fc.string({ minLength: 2 }),
        fc.constantFrom('admin', 'usuario'),
        async (email, password, name, level) => {
          // First registration should succeed
          await register({ email, password, name, level });
          
          // Second registration with same email should fail
          await expect(
            register({ 
              email, 
              password: 'different', 
              name: 'Different Name',
              level: 'usuario'
            })
          ).rejects.toThrow('ya está registrado');
          
          // Cleanup
          StorageService.clearAll();
        }
      ),
      propertyTestConfig
    );
  });
});
```

### Test Coverage Goals

- Unit test coverage: 80%+ for all service and context code
- Property tests: All 10 correctness properties implemented
- Integration tests: Critical user flows (register → login → logout)
- UI tests: Form validation and error display

### Testing Tools

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **fast-check**: Property-based testing
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM environment for tests

## Implementation Notes

### Security Considerations

1. **Password Storage**: Never store plain text passwords, always use bcrypt hashing
2. **Token Security**: Tokens should be unique and time-limited
3. **Input Sanitization**: Validate and sanitize all user inputs
4. **Error Messages**: Don't reveal whether an email exists during login failures

### Performance Considerations

1. **Bcrypt Performance**: Hashing is intentionally slow (10 rounds), use async operations
2. **localStorage Limits**: Monitor storage usage, implement cleanup for expired tokens
3. **Form Validation**: Use debouncing for real-time validation to avoid excessive re-renders

### Code Organization

```
src/
├── context/
│   └── AuthContext.tsx          # Auth state management
├── services/
│   ├── authService.ts           # Authentication logic
│   └── storageService.ts        # Storage operations
├── schemas/
│   └── authSchemas.ts           # Zod validation schemas
├── pages/
│   ├── Login.tsx                # Login page
│   └── Register.tsx             # Registration page
├── components/
│   └── ProtectedRoute.tsx       # Route protection
├── types/
│   └── auth.ts                  # TypeScript types
└── test/
    ├── auth.test.ts             # Unit tests
    └── auth.property.test.ts    # Property tests
```

### Migration from Current Implementation

The current implementation needs these changes:
1. Add `level` field to User and RegisteredUser types
2. Replace plain text password storage with bcrypt hashing
3. Implement token generation and validation
4. Add user level selector to registration form
5. Update validation to match new requirements
6. Add comprehensive error handling
7. Implement property-based tests

## Future Enhancements

1. **Backend Integration**: Replace localStorage with real API calls
2. **JWT Tokens**: Use proper JWT tokens instead of simple strings
3. **OAuth**: Add social login (Google, Facebook)
4. **Password Reset**: Implement forgot password functionality
5. **Email Verification**: Add email verification step
6. **Two-Factor Authentication**: Add 2FA for enhanced security
7. **Session Management**: Implement refresh tokens for extended sessions
