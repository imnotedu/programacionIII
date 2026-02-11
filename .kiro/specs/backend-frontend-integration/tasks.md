# Implementation Plan: Backend-Frontend Integration

## Overview

Este plan implementa la integración completa entre el backend existente (Node.js + Express + SQLite) y el frontend (React + TypeScript). Los servicios API ya están creados, por lo que el enfoque principal es actualizar los contextos de React para consumir el backend y actualizar los componentes para usar estos contextos actualizados.

## Tasks

- [x] 1. Actualizar ProductContext para usar el backend
  - Reemplazar localStorage con llamadas a productApiService
  - Agregar estados de loading y error
  - Implementar fetchProducts para cargar productos del backend
  - Implementar getProductByCode para búsqueda
  - Actualizar métodos CRUD para usar el backend
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ]* 1.1 Escribir property test para ProductContext
  - **Property 5: Product Search by Code**
  - **Validates: Requirements 2.2**

- [ ]* 1.2 Escribir property test para admin product creation
  - **Property 6: Admin Product Creation with Token**
  - **Validates: Requirements 3.1**

- [ ]* 1.3 Escribir property test para product update
  - **Property 7: Product Update Synchronization**
  - **Validates: Requirements 3.2**

- [ ]* 1.4 Escribir property test para product deletion
  - **Property 8: Product Deletion Removal**
  - **Validates: Requirements 3.3**

- [ ] 2. Actualizar CartContext para usar el backend
  - Reemplazar localStorage con llamadas a cartApiService
  - Agregar estados de loading y error
  - Implementar fetchCart para cargar carrito del backend
  - Actualizar addToCart para sincronizar con backend
  - Actualizar updateQuantity para sincronizar con backend
  - Actualizar removeFromCart para sincronizar con backend
  - Actualizar clearCart para sincronizar con backend
  - Agregar validación de stock antes de operaciones
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 2.1 Escribir property test para add to cart
  - **Property 10: Add to Cart Context Update**
  - **Validates: Requirements 4.1**

- [ ]* 2.2 Escribir property test para cart quantity update
  - **Property 11: Cart Quantity Synchronization**
  - **Validates: Requirements 4.2**

- [ ]* 2.3 Escribir property test para cart item removal
  - **Property 12: Cart Item Removal**
  - **Validates: Requirements 4.3**

- [ ]* 2.4 Escribir property test para clear cart idempotence
  - **Property 13: Clear Cart Idempotence**
  - **Validates: Requirements 4.4**

- [ ]* 2.5 Escribir property test para cart restoration
  - **Property 14: Cart Restoration on Load**
  - **Validates: Requirements 4.5**

- [ ]* 2.6 Escribir property test para stock validation
  - **Property 15: Stock Validation Prevention**
  - **Validates: Requirements 4.6**

- [ ] 3. Checkpoint - Verificar contextos actualizados
  - Asegurar que todos los tests pasen, preguntar al usuario si surgen dudas.

- [ ] 4. Actualizar AuthContext para manejo de errores 401
  - Agregar interceptor para errores 401 en api.ts
  - Implementar logout automático en caso de token expirado
  - Agregar redirección a login después de logout automático
  - _Requirements: 1.5_

- [ ]* 4.1 Escribir unit test para manejo de error 401
  - Simular respuesta 401 del backend
  - Verificar que se ejecuta logout automático
  - _Requirements: 1.5_

- [ ]* 4.2 Escribir property test para logout cleanup
  - **Property 3: Logout State Cleanup**
  - **Validates: Requirements 1.3**

- [ ]* 4.3 Escribir property test para session restoration
  - **Property 4: Session Restoration**
  - **Validates: Requirements 1.4**

- [ ] 5. Actualizar página Login
  - Conectar formulario con AuthContext.login()
  - Agregar manejo de estados de loading
  - Mostrar errores del backend en la UI
  - Redirigir a /store después de login exitoso
  - _Requirements: 1.2_

- [ ]* 5.1 Escribir property test para login context update
  - **Property 2: Login Context Update**
  - **Validates: Requirements 1.2**

- [ ]* 5.2 Escribir unit test para login error display
  - Verificar que errores del backend se muestran
  - _Requirements: 5.4_

- [ ] 6. Actualizar página Register
  - Conectar formulario con AuthContext.register()
  - Agregar manejo de estados de loading
  - Mostrar errores del backend en la UI
  - Redirigir a /store después de registro exitoso
  - _Requirements: 1.1_

- [ ]* 6.1 Escribir property test para registration token storage
  - **Property 1: Registration Token Storage**
  - **Validates: Requirements 1.1**

- [ ]* 6.2 Escribir unit test para register error display
  - Verificar que errores de validación se muestran
  - _Requirements: 5.4_

- [ ] 7. Actualizar página Store
  - Usar ProductContext.fetchProducts() en useEffect
  - Mostrar loading state mientras carga productos
  - Mostrar mensaje de error si falla la carga
  - Actualizar addToCart para usar CartContext actualizado
  - _Requirements: 2.1, 2.4_

- [ ]* 7.1 Escribir unit test para product loading
  - Verificar que se muestra loading state
  - Verificar que se muestran productos después de cargar
  - _Requirements: 2.1_

- [ ]* 7.2 Escribir unit test para error display
  - Simular error de carga de productos
  - Verificar que se muestra mensaje de error
  - _Requirements: 2.4_

- [ ] 8. Actualizar página Cart
  - Usar CartContext actualizado para mostrar items
  - Actualizar handlers para usar métodos del contexto
  - Mostrar loading state durante operaciones
  - Mostrar errores de stock si ocurren
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 8.1 Escribir property test para cart counter sync
  - **Property 21: Cart Counter Synchronization**
  - **Validates: Requirements 8.2**

- [ ] 9. Actualizar página AdminProduct
  - Usar ProductContext para CRUD de productos
  - Agregar verificación de permisos de admin
  - Mostrar loading states durante operaciones
  - Mostrar errores de validación del backend
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 9.1 Escribir property test para non-admin access denial
  - **Property 9: Non-Admin Access Denial**
  - **Validates: Requirements 3.4**

- [ ]* 9.2 Escribir unit test para admin permission error
  - Simular error 403 del backend
  - Verificar que se muestra mensaje apropiado
  - _Requirements: 3.5_

- [ ] 10. Actualizar componente ProtectedRoute
  - Verificar autenticación usando AuthContext
  - Redirigir a /login si no autenticado
  - Verificar nivel de admin si requireAdmin es true
  - Redirigir a /access-denied si no es admin
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 10.1 Escribir property test para unauthenticated redirect
  - **Property 17: Unauthenticated Route Redirect**
  - **Validates: Requirements 7.1**

- [ ]* 10.2 Escribir property test para non-admin redirect
  - **Property 18: Non-Admin Route Redirect**
  - **Validates: Requirements 7.2**

- [ ]* 10.3 Escribir property test para authenticated access
  - **Property 19: Authenticated Route Access**
  - **Validates: Requirements 7.3**

- [ ]* 10.4 Escribir property test para admin access
  - **Property 20: Admin Route Access**
  - **Validates: Requirements 7.4**

- [ ] 11. Actualizar componente Header/Navbar
  - Usar CartContext.totalItems para mostrar contador
  - Asegurar que el contador se actualiza en tiempo real
  - _Requirements: 8.2_

- [ ] 12. Agregar componente de manejo de errores global
  - Crear componente Toast o Notification para mostrar errores
  - Integrar con contextos para mostrar errores de API
  - Agregar mensajes específicos para diferentes tipos de error
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 12.1 Escribir property test para backend error display
  - **Property 16: Backend Error Message Display**
  - **Validates: Requirements 5.4**

- [ ]* 12.2 Escribir unit test para network error
  - Simular error de red
  - Verificar mensaje apropiado
  - _Requirements: 5.3_

- [ ]* 12.3 Escribir unit test para backend unavailable
  - Simular backend no disponible
  - Verificar mensaje apropiado
  - _Requirements: 5.5_

- [ ] 13. Checkpoint final - Verificar integración completa
  - Asegurar que todos los tests pasen
  - Verificar que el backend está corriendo
  - Probar flujo completo: registro → login → productos → carrito
  - Preguntar al usuario si surgen dudas

- [ ] 14. Crear archivo de configuración de entorno
  - Crear archivo .env con URL del backend
  - Actualizar api.ts para usar variable de entorno
  - Documentar configuración en README
  - _Requirements: Todos_

- [ ]* 14.1 Escribir unit test para configuración de API
  - Verificar que la URL base se configura correctamente
  - Verificar que los headers se incluyen correctamente

## Notes

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los property tests validan propiedades de correctness universales
- Los unit tests validan ejemplos específicos y casos de error
- El backend debe estar corriendo en `http://localhost:3000` durante el desarrollo
- Usar `npm run server` en la carpeta backend para iniciar el servidor

