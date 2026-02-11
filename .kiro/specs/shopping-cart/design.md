# Design Document - Shopping Cart

## Overview

Sistema de carrito de compras que permite a usuarios autenticados gestionar productos antes de realizar una compra. El carrito persiste en base de datos SQLite y se mantiene entre sesiones.

## Architecture

### Database Schema

**Tabla: carts**
```sql
CREATE TABLE carts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)
```

**Tabla: cart_items**
```sql
CREATE TABLE cart_items (
  id TEXT PRIMARY KEY,
  cartId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(cartId, productId)
)
```

### API Endpoints

- `GET /api/cart` - Obtener carrito del usuario autenticado
- `POST /api/cart/items` - Agregar producto al carrito
- `PUT /api/cart/items/:productId` - Actualizar cantidad de un producto
- `DELETE /api/cart/items/:productId` - Eliminar producto del carrito
- `DELETE /api/cart` - Limpiar carrito completo

## Components and Interfaces

### CartController

Controlador que maneja las operaciones del carrito:

```typescript
interface CartController {
  getCart(req: Request, res: Response, next: NextFunction): void
  addItem(req: Request, res: Response, next: NextFunction): void
  updateItem(req: Request, res: Response, next: NextFunction): void
  removeItem(req: Request, res: Response, next: NextFunction): void
  clearCart(req: Request, res: Response, next: NextFunction): void
}
```

### CartService

Servicio que contiene la lógica de negocio:

```typescript
interface CartService {
  getOrCreateCart(userId: string): Cart
  getCartWithItems(userId: string): CartWithItems
  addItemToCart(userId: string, productId: string, quantity: number): CartItem
  updateItemQuantity(userId: string, productId: string, quantity: number): CartItem
  removeItemFromCart(userId: string, productId: string): void
  clearCart(userId: string): void
  calculateCartTotal(items: CartItemWithProduct[]): number
}
```

## Data Models

### Cart
```typescript
interface Cart {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}
```

### CartItem
```typescript
interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  createdAt: string
  updatedAt: string
}
```

### CartItemWithProduct
```typescript
interface CartItemWithProduct extends CartItem {
  product: Product
  subtotal: number
}
```

### CartResponse
```typescript
interface CartResponse {
  cart: Cart
  items: CartItemWithProduct[]
  total: number
  itemCount: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Cart Uniqueness per User
*For any* user, there should exist exactly one active cart at any time.
**Validates: Requirements 6.4**

### Property 2: Item Quantity Positivity
*For any* cart item, the quantity must always be greater than 0.
**Validates: Requirements 1.3, 3.1**

### Property 3: Stock Validation
*For any* operation that adds or updates cart items, the requested quantity must not exceed available stock.
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 4: Cart Total Calculation
*For any* cart with items, the total should equal the sum of all (item.price × item.quantity).
**Validates: Requirements 2.3**

### Property 5: Subtotal Calculation
*For any* cart item, the subtotal should equal (product.price × quantity).
**Validates: Requirements 2.2**

### Property 6: Empty Cart Handling
*For any* user with no items in cart, getting the cart should return total = 0 and itemCount = 0.
**Validates: Requirements 2.4**

### Property 7: Item Uniqueness in Cart
*For any* cart, each product should appear at most once (no duplicate products).
**Validates: Requirements 1.2**

### Property 8: Authentication Required
*For any* cart operation, the request must include a valid authentication token.
**Validates: Requirements 1.5, 2.5, 3.5, 4.4, 5.3**

### Property 9: Product Existence Validation
*For any* add or update operation, the product must exist in the products table.
**Validates: Requirements 1.4**

### Property 10: Cart Persistence
*For any* user, logging out and logging back in should preserve cart items.
**Validates: Requirements 8.1, 8.2**

## Error Handling

### Error Types

1. **NotFoundError (404)**
   - Carrito no encontrado
   - Producto no encontrado
   - Item no encontrado en carrito

2. **ValidationError (400)**
   - Cantidad inválida (≤ 0)
   - Cantidad excede límite (> 1000)
   - Datos de entrada inválidos

3. **ConflictError (409)**
   - Stock insuficiente

4. **UnauthorizedError (401)**
   - Token inválido o expirado
   - Usuario no autenticado

### Error Response Format
```typescript
{
  success: false,
  message: string,
  errors?: Array<{
    field: string,
    message: string
  }>
}
```

## Testing Strategy

### Unit Tests
- Validación de schemas con Zod
- Cálculo de totales y subtotales
- Manejo de errores específicos
- Validaciones de stock

### Property-Based Tests
- Probar propiedades con múltiples combinaciones de datos
- Generar carritos aleatorios y verificar invariantes
- Validar cálculos con diferentes cantidades y precios
- Verificar unicidad de productos en carrito

### Integration Tests
- Flujo completo: agregar → actualizar → eliminar
- Persistencia entre sesiones
- Validación de autenticación en todos los endpoints
- Cascada de eliminación (producto eliminado → removido de carritos)

### Test Configuration
- Mínimo 100 iteraciones por property test
- Cada test debe referenciar su propiedad del diseño
- Tag format: **Feature: shopping-cart, Property {number}: {property_text}**

## Implementation Notes

### Cart Creation Strategy
- Crear carrito automáticamente al agregar primer item
- Usar patrón "get or create" para evitar duplicados
- Un carrito por usuario (constraint en DB)

### Quantity Update Strategy
- Si producto ya existe: sumar cantidades
- Si cantidad resultante > stock: rechazar
- Actualizar timestamp del carrito en cada operación

### Performance Considerations
- Índices en userId, cartId, productId
- JOIN eficiente para obtener items con productos
- Cálculo de totales en memoria (no en DB)

### Security Considerations
- Validar que usuario solo acceda a su propio carrito
- Verificar autenticación en todos los endpoints
- Validar stock antes de confirmar operaciones
