# Implementation Plan: User Authentication

## Overview

Este plan de implementación transforma el sistema de autenticación actual en uno que cumple completamente con los requisitos del profesor. El enfoque es incremental, construyendo sobre la base existente y agregando las funcionalidades faltantes paso a paso.

## Tasks

- [x] 1. Setup and Dependencies
  - Instalar bcryptjs para encriptación de contraseñas
  - Instalar fast-check para property-based testing
  - Configurar tipos de TypeScript para las nuevas dependencias
  - _Requirements: 3.1, 3.4_

- [x] 2. Update Type Definitions
  - [x] 2.1 Create auth types file
    - Crear `src/types/auth.ts` con todas las interfaces necesarias
    - Agregar `UserLevel` type ('admin' | 'usuario')
    - Agregar `RegisteredUser` interface con campo `level` y `passwordHash`
    - Agregar `AuthToken` interface para tokens de autenticación
    - Agregar `LoginCredentials` y `RegisterData` interfaces
    - Actualizar `AuthContextType` con nuevos métodos
    - _Requirements: 1.1, 2.1, 4.1_

- [x] 3. Create Authentication Service
  - [x] 3.1 Implement password hashing service
    - Crear `src/services/authService.ts`
    - Implementar `hashPassword()` usando bcrypt con 10 salt rounds
    - Implementar `comparePassword()` para validar contraseñas
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 3.2 Write property test for password hashing
    - **Property 1: Password Encryption Consistency**
    - **Validates: Requirements 3.1, 3.4**

  - [x] 3.3 Implement token generation
    - Implementar `generateToken()` para crear tokens simples
    - Implementar `isTokenValid()` para validar expiración de tokens
    - Tokens deben incluir userId, level y expiración de 24 horas
    - _Requirements: 2.4, 6.1_

  - [x] 3.4 Write property test for token validity
    - **Property 3: Authentication Token Validity**
    - **Validates: Requirements 2.4, 6.1**

- [x] 4. Create Storage Service
  - [x] 4.1 Implement storage service
    - Crear `src/services/storageService.ts`
    - Implementar métodos para gestionar usuarios en localStorage
    - Implementar métodos para gestionar tokens
    - Implementar métodos para gestionar usuario actual
    - Agregar manejo de errores para operaciones de localStorage
    - _Requirements: 1.1, 2.5, 6.1, 6.2_

  - [x] 4.2 Write unit tests for storage service
    - Test para guardar y recuperar usuarios
    - Test para buscar usuario por email
    - Test para operaciones de token
    - Test para manejo de errores
    - _Requirements: 1.1, 2.5_

- [x] 5. Create Validation Schemas
  - [x] 5.1 Implement Zod schemas
    - Crear `src/schemas/authSchemas.ts`
    - Implementar `loginSchema` con validaciones de email y password
    - Implementar `registerSchema` con todas las validaciones requeridas
    - Incluir validación de nivel de usuario
    - Incluir validación de confirmación de contraseña
    - _Requirements: 1.5, 1.6, 1.7, 5.1, 5.2, 5.3_

  - [x] 5.2 Write property tests for validation
    - **Property 6: Form Validation Completeness**
    - **Property 8: Password Minimum Length**
    - **Property 9: Email Format Validation**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 1.6, 1.5**

- [x] 6. Update Auth Context
  - [x] 6.1 Refactor AuthContext with new services
    - Actualizar `src/context/AuthContext.tsx`
    - Integrar AuthService para hashing de contraseñas
    - Integrar StorageService para persistencia
    - Actualizar método `login()` para usar passwordHash y generar token
    - Actualizar método `register()` para incluir campo `level`
    - Implementar método `isAdmin()` para verificar nivel de usuario
    - Actualizar inicialización de estado con validación de token
    - _Requirements: 1.1, 2.1, 2.3, 2.4, 3.1, 4.1, 4.3_

  - [x] 6.2 Write property tests for auth context
    - **Property 2: Email Uniqueness**
    - **Property 4: Login Credential Validation**
    - **Property 5: User Level Persistence**
    - **Property 7: Session Persistence**
    - **Property 10: Logout Cleanup**
    - **Validates: Requirements 1.3, 2.2, 2.3, 4.1, 4.2, 4.3, 6.2, 6.3, 6.4**

- [x] 7. Checkpoint - Core Services Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Update Registration Page
  - [x] 8.1 Add user level selector to registration form
    - Actualizar `src/pages/Register.tsx`
    - Agregar radio buttons o select para elegir nivel (admin/usuario)
    - Integrar react-hook-form con registerSchema
    - Actualizar llamada a `register()` para incluir nivel seleccionado
    - Mantener diseño responsive y consistente
    - _Requirements: 1.2, 4.1_

  - [x] 8.2 Update form validation
    - Integrar Zod schema con react-hook-form
    - Mostrar errores de validación en tiempo real
    - Actualizar mensajes de error según requirements
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 8.3 Write unit tests for registration page
    - Test de renderizado del formulario
    - Test de validación de campos
    - Test de selección de nivel de usuario
    - Test de manejo de errores
    - _Requirements: 1.1, 1.2, 5.1_

- [ ] 9. Update Login Page
  - [x] 9.1 Update login form validation
    - Actualizar `src/pages/Login.tsx`
    - Integrar react-hook-form con loginSchema
    - Actualizar manejo de errores según nuevos error codes
    - Asegurar que los mensajes de error no revelen si el email existe
    - _Requirements: 2.1, 2.2, 5.1, 5.2_

  - [ ] 9.2 Write unit tests for login page
    - Test de renderizado del formulario
    - Test de validación de campos
    - Test de manejo de errores
    - Test de redirección después de login exitoso
    - _Requirements: 2.1, 2.2_

- [ ] 10. Update Protected Routes
  - [x] 10.1 Add admin-level protection
    - Actualizar `src/components/ProtectedRoute.tsx`
    - Agregar prop opcional `requireAdmin` para rutas admin-only
    - Usar método `isAdmin()` del AuthContext
    - Redirigir a página de acceso denegado si no es admin
    - _Requirements: 4.4_

  - [ ] 10.2 Write unit tests for protected routes
    - Test de redirección cuando no está autenticado
    - Test de acceso permitido cuando está autenticado
    - Test de protección de rutas admin
    - _Requirements: 4.4_

- [ ] 11. Error Handling Implementation
  - [ ] 11.1 Create centralized error handling
    - Crear `src/utils/authErrors.ts`
    - Implementar clase `AuthError` con códigos de error
    - Implementar enum `AuthErrorCode`
    - Actualizar todos los servicios para usar AuthError
    - _Requirements: 7.3_

  - [ ] 11.2 Update error display in UI
    - Actualizar componentes para mostrar errores específicos
    - Usar toast notifications para feedback al usuario
    - Asegurar mensajes de error user-friendly
    - _Requirements: 5.5_

- [ ] 12. Checkpoint - UI Updates Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Integration Testing
  - [ ] 13.1 Write integration tests for complete flows
    - Test de flujo completo: registro → auto-login → navegación
    - Test de flujo: login → navegación → logout
    - Test de flujo: intento de acceso a ruta protegida → login → acceso
    - Test de persistencia de sesión después de refresh
    - _Requirements: 1.1, 2.1, 6.1, 6.2, 6.3_

- [ ] 14. Code Quality and Documentation
  - [ ] 14.1 Add JSDoc comments
    - Documentar todas las funciones públicas
    - Agregar ejemplos de uso en comentarios
    - Documentar tipos complejos
    - _Requirements: 7.1, 7.2_

  - [ ] 14.2 Code review and refactoring
    - Revisar nombres de variables y funciones
    - Asegurar consistencia en el código
    - Eliminar código duplicado
    - Optimizar imports
    - _Requirements: 7.1, 7.2, 7.4_

- [ ] 15. Final Testing and Validation
  - [ ] 15.1 Run all tests
    - Ejecutar suite completa de unit tests
    - Ejecutar suite completa de property tests
    - Verificar coverage mínimo de 80%
    - _Requirements: All_

  - [ ] 15.2 Manual testing checklist
    - Probar registro con nivel admin
    - Probar registro con nivel usuario
    - Probar login con credenciales correctas
    - Probar login con credenciales incorrectas
    - Probar persistencia de sesión
    - Probar logout
    - Probar acceso a rutas protegidas
    - Probar validaciones de formularios
    - _Requirements: All_

- [ ] 16. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- La implementación debe mantener compatibilidad con el código existente
- Todos los cambios deben ser backwards compatible hasta que se complete la migración
- El sistema debe funcionar correctamente en cada checkpoint
