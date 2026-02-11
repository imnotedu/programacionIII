# Implementation Plan: Shopping Cart

## Overview

Implementación del sistema de carrito de compras con persistencia en SQLite, validaciones de stock, y cálculo automático de totales.

## Tasks

- [x] 1. Configurar base de datos y schemas
  - Actualizar database.ts con tablas de carritos
  - Crear schemas de validación con Zod
  - Agregar índices para optimización
  - _Requirements: 6.3, 8.3_

- [x] 2. Implementar servicio de carrito
  - [x] 2.1 Crear funciones de gestión de carrito
    - Implementar getOrCreateCart
    - Implementar getCartWithItems con JOIN
    - Implementar calculateCartTotal
    - _Requirements: 6.1, 6.2, 2.2, 2.3_

  - [x] 2.2 Implementar addItemToCart
    - Validar que producto existe
    - Validar stock disponible
    - Si producto existe en carrito, sumar cantidades
    - Si no existe, crear nuevo item
    - _Requirements: 1.1, 1.2, 1.4, 7.1, 7.2_

  - [x] 2.3 Implementar updateItemQuantity
    - Validar que item existe
    - Validar stock disponible
    - Actualizar cantidad
    - _Requirements: 3.1, 3.2, 7.3_

  - [x] 2.4 Implementar removeItemFromCart
    - Validar que item existe
    - Eliminar item del carrito
    - _Requirements: 4.1, 4.2_

  - [x] 2.5 Implementar clearCart
    - Eliminar todos los items del carrito
    - Manejar carrito vacío sin error
    - _Requirements: 5.1, 5.2_

- [x] 3. Implementar controlador de carrito
  - [x] 3.1 Crear getCart endpoint
    - Obtener userId del token
    - Llamar a getCartWithItems
    - Retornar carrito con items y totales
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Crear addItem endpoint
    - Validar datos con Zod
    - Llamar a addItemToCart
    - Retornar item agregado
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 3.3 Crear updateItem endpoint
    - Validar datos con Zod
    - Llamar a updateItemQuantity
    - Retornar item actualizado
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 3.4 Crear removeItem endpoint
    - Validar productId
    - Llamar a removeItemFromCart
    - Retornar confirmación
    - _Requirements: 4.1, 4.2_

  - [x] 3.5 Crear clearCart endpoint
    - Llamar a clearCart
    - Retornar confirmación
    - _Requirements: 5.1, 5.2_

- [x] 4. Configurar rutas
  - Crear cart.routes.ts
  - Aplicar middleware de autenticación a todas las rutas
  - Registrar rutas en app.ts
  - _Requirements: 1.5, 2.5, 3.5, 4.4, 5.3_

- [x] 5. Checkpoint - Pruebas manuales
  - Probar agregar productos al carrito
  - Probar actualizar cantidades
  - Probar eliminar productos
  - Probar limpiar carrito
  - Verificar cálculo de totales
  - Verificar validaciones de stock

- [x] 6. Crear script de pruebas automatizadas
  - Crear test-cart.ps1
  - Probar flujo completo de carrito
  - Probar validaciones de stock
  - Probar autenticación requerida
  - Probar persistencia entre sesiones
  - _Requirements: 8.1, 8.2_

- [x] 7. Actualizar documentación
  - Actualizar README.md con endpoints de carrito
  - Documentar estructura de respuestas
  - Agregar ejemplos de uso
  - Actualizar PROGRESO_BACKEND.md

## Notes

- Todas las rutas requieren autenticación
- Validar stock en cada operación de agregar/actualizar
- Calcular totales en el servidor, no en el cliente
- Un carrito por usuario (enforced por DB)
- Persistencia automática en SQLite
