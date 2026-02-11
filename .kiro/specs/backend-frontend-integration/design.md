# Design Document

## Overview

Este diseño describe la integración completa entre el backend existente (Node.js + Express + SQLite) y el frontend (React + TypeScript) de PowerFit. La arquitectura se basa en servicios API que encapsulan las llamadas HTTP, contextos de React para gestión de estado global, y componentes que consumen estos servicios.

El backend ya está completamente funcional en `http://localhost:3000/api` con:
- Autenticación JWT
- CRUD de productos
- Gestión de carrito
- Validaciones con Zod

El frontend ya tiene servicios API creados (`authApiService`, `productApiService`, `cartApiService`) y un `AuthContext` básico. El objetivo es completar la integración actualizando los contextos, componentes y páginas para consumir el backend.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Components                         │  │
│  │  (Login, Register, Store, Cart, AdminProduct)        │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │           React Contexts                              │  │
│  │  (AuthContext, ProductContext, CartContext)          │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │           API Services                                │  │
│  │  (authApiService, productApiService, cartApiService) │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP Requests (JWT Token in headers)
                    │
┌───────────────────▼──────────────────────────────────────────┐
│                         Backend                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Express Routes                           │  │
│  │  (/auth, /products, /cart)                           │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │           Controllers                                 │  │
│  │  (auth, product, cart)                               │  │
│  └────────────────┬─────────────────────────────────────┘  │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐  │
│  │           SQLite Database                             │  │
│  │  (users, products, carts, cart_items)                │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Authentication Flow:**
   - User submits login/register form
   - Component calls AuthContext method
   - AuthContext calls authApiService
   - Service sends HTTP request with credentials
   - Backend validates and returns JWT token + user data
   - Service stores token in localStorage
   - AuthContext updates state
   - UI updates to show authenticated state

2. **Product Management Flow:**
   - Component requests products
   - ProductContext calls productApiService
   - Service sends HTTP GET request
   - Backend returns product list
   - Context updates state
   - Components re-render with new data

3. **Cart Operations Flow:**
   - User adds product to cart
   - Component calls CartContext method
   - CartContext calls cartApiService with JWT token
   - Backend validates token, updates database
   - Backend returns updated cart
   - Context updates state
   - UI reflects changes

## Components and Interfaces

### API Services (Already Implemented)

Los servicios API ya están implementados en:
- `src/services/api.ts` - Cliente HTTP base
- `src/services/authApiService.ts` - Autenticación
- `src/services/productApiService.ts` - Productos
- `src/services/cartApiService.ts` - Carrito

Estos servicios ya manejan:
- Construcción de URLs
- Inclusión de JWT token en headers
- Manejo de respuestas y errores
- Tipado TypeScript

### Context: ProductContext (To Create)

```typescript
interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getProductByCode: (code: string) => Promise<Product | null>;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}
```

**Responsibilities:**
- Mantener lista de productos en memoria
- Proporcionar métodos para CRUD de productos
- Gestionar estados de carga y error
- Cachear productos para evitar peticiones innecesarias

### Context: CartContext (To Create)

```typescript
interface CartContextType {
  cart: CartData | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  total: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}
```

**Responsibilities:**
- Mantener estado del carrito del usuario
- Sincronizar con backend en cada operación
- Calcular totales y contadores
- Gestionar estados de carga y error

### Component: Protected Routes

```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}
```

**Responsibilities:**
- Verificar autenticación antes de renderizar
- Redirigir a login si no autenticado
- Verificar nivel de administrador si requerido
- Redirigir a access-denied si no es admin

### Pages to Update

1. **Login.tsx**
   - Usar AuthContext.login()
   - Mostrar errores del backend
   - Redirigir después de login exitoso

2. **Register.tsx**
   - Usar AuthContext.register()
   - Validar datos antes de enviar
   - Mostrar errores del backend

3. **Store.tsx**
   - Usar ProductContext.fetchProducts()
   - Mostrar loading state
   - Permitir agregar al carrito (CartContext)

4. **Cart.tsx**
   - Usar CartContext para mostrar items
   - Permitir actualizar cantidades
   - Permitir eliminar items
   - Mostrar total calculado

5. **AdminProduct.tsx**
   - Usar ProductContext para CRUD
   - Verificar permisos de admin
   - Mostrar formularios de creación/edición

## Data Models

### Frontend Types (Already Defined)

```typescript
// User
interface User {
  id: string;
  email: string;
  name: string;
  level: 'admin' | 'usuario';
}

// Product
interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// Cart
interface CartData {
  cart: {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  items: CartItem[];
  total: number;
  itemCount: number;
}

// CartItem
interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
  subtotal: number;
}
```

### API Request/Response Formats

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "level": "usuario"
  }
}
```

**Get Products Response:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Proteína Whey",
      "code": "PROT001",
      "price": 29.99,
      "description": "Proteína de suero",
      "category": "Proteínas",
      "imageUrl": null,
      "stock": 50,
      "createdAt": "2026-02-07T...",
      "updatedAt": "2026-02-07T..."
    }
  ],
  "count": 1
}
```

**Get Cart Response:**
```json
{
  "cart": {
    "id": "uuid",
    "userId": "uuid",
    "createdAt": "2026-02-07T...",
    "updatedAt": "2026-02-07T..."
  },
  "items": [
    {
      "id": "uuid",
      "cartId": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "product": { /* Product object */ },
      "subtotal": 59.98,
      "createdAt": "2026-02-07T...",
      "updatedAt": "2026-02-07T..."
    }
  ],
  "total": 59.98,
  "itemCount": 2
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Registration Token Storage
*For any* valid registration data (name, email, password), when a user successfully registers, the JWT token received from the backend should be stored in localStorage and the user data should be stored in the AuthContext.
**Validates: Requirements 1.1**

### Property 2: Login Context Update
*For any* valid login credentials, when authentication succeeds, the AuthContext should be updated with the user data and the JWT token should be available for subsequent requests.
**Validates: Requirements 1.2**

### Property 3: Logout State Cleanup
*For any* authenticated user, when logout is called, both localStorage (token and user data) and AuthContext state should be completely cleared.
**Validates: Requirements 1.3, 6.4**

### Property 4: Session Restoration
*For any* valid JWT token stored in localStorage, when the application loads, the session should be restored by validating the token with the backend and updating the AuthContext.
**Validates: Requirements 1.4, 6.2**

### Property 5: Product Search by Code
*For any* valid product code, when searching for a product, the frontend should retrieve and display the correct product from the backend.
**Validates: Requirements 2.2**

### Property 6: Admin Product Creation with Token
*For any* valid product data and authenticated admin user, when creating a product, the request should include the JWT token in the Authorization header.
**Validates: Requirements 3.1**

### Property 7: Product Update Synchronization
*For any* valid product update and authenticated admin, when a product is updated, the changes should be reflected in the local ProductContext state.
**Validates: Requirements 3.2**

### Property 8: Product Deletion Removal
*For any* product in the product list, when an admin deletes it, the product should be removed from the local ProductContext state.
**Validates: Requirements 3.3**

### Property 9: Non-Admin Access Denial
*For any* user with level 'usuario' (non-admin), when attempting to access admin functions, the access should be denied and an appropriate message should be shown.
**Validates: Requirements 3.4**

### Property 10: Add to Cart Context Update
*For any* product and authenticated user, when adding a product to the cart, the CartContext should be updated with the new item and the backend should be synchronized.
**Validates: Requirements 4.1, 8.3**

### Property 11: Cart Quantity Synchronization
*For any* cart item, when the quantity is updated, the change should be synchronized with the backend and reflected in the CartContext.
**Validates: Requirements 4.2**

### Property 12: Cart Item Removal
*For any* product in the cart, when removed, the item should be deleted from the backend and removed from the CartContext.
**Validates: Requirements 4.3**

### Property 13: Clear Cart Idempotence
*For any* cart state, when clearCart is called, the CartContext should be empty and calling clearCart again should have no additional effect (idempotent operation).
**Validates: Requirements 4.4**

### Property 14: Cart Restoration on Load
*For any* authenticated user with items in their cart, when the application loads, the cart should be fetched from the backend and restored in the CartContext.
**Validates: Requirements 4.5**

### Property 15: Stock Validation Prevention
*For any* product with insufficient stock, when attempting to add or update quantity in the cart, the operation should be prevented and an error message should be displayed.
**Validates: Requirements 4.6**

### Property 16: Backend Error Message Display
*For any* validation error returned by the backend, the frontend should display the specific error message to the user.
**Validates: Requirements 5.4**

### Property 17: Unauthenticated Route Redirect
*For any* protected route, when accessed by an unauthenticated user, the user should be redirected to the login page.
**Validates: Requirements 7.1**

### Property 18: Non-Admin Route Redirect
*For any* admin-only route, when accessed by a non-admin authenticated user, the user should be redirected to an access denied page.
**Validates: Requirements 7.2**

### Property 19: Authenticated Route Access
*For any* protected route, when accessed by an authenticated user, the route should render successfully.
**Validates: Requirements 7.3**

### Property 20: Admin Route Access
*For any* admin-only route, when accessed by an admin user, the route should render successfully with full access.
**Validates: Requirements 7.4**

### Property 21: Cart Counter Synchronization
*For any* cart modification (add, update, remove, clear), the item counter displayed in the navbar should reflect the current total number of items in the cart.
**Validates: Requirements 8.2**

## Error Handling

### Authentication Errors

**401 Unauthorized:**
- Trigger: Invalid or expired JWT token
- Action: Clear localStorage, reset AuthContext, redirect to login
- User Message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."

**403 Forbidden:**
- Trigger: User lacks required permissions (e.g., non-admin accessing admin routes)
- Action: Redirect to access denied page
- User Message: "No tienes permisos para acceder a esta función."

**400 Bad Request (Login/Register):**
- Trigger: Invalid credentials or validation errors
- Action: Display specific error messages from backend
- User Message: Backend error message (e.g., "El email ya está registrado")

### Product Errors

**404 Not Found:**
- Trigger: Product not found by ID or code
- Action: Display error message, optionally redirect to store
- User Message: "Producto no encontrado."

**400 Bad Request (CRUD):**
- Trigger: Invalid product data (price <= 0, duplicate code, etc.)
- Action: Display validation errors from backend
- User Message: Backend error message (e.g., "El código ya existe")

### Cart Errors

**400 Bad Request (Stock):**
- Trigger: Insufficient stock for requested quantity
- Action: Prevent operation, display error
- User Message: "Stock insuficiente. Solo quedan X unidades disponibles."

**404 Not Found:**
- Trigger: Product not found when adding to cart
- Action: Display error, refresh product list
- User Message: "El producto ya no está disponible."

### Network Errors

**Network Error (fetch failed):**
- Trigger: Backend not reachable, network issues
- Action: Display error message, optionally retry
- User Message: "Error de conexión. Verifica tu conexión a internet."

**500 Internal Server Error:**
- Trigger: Backend error
- Action: Display generic error message
- User Message: "Error del servidor. Por favor, intenta más tarde."

### Error Display Strategy

1. **Toast Notifications:** For temporary feedback (success, errors)
2. **Inline Errors:** For form validation errors
3. **Error Pages:** For route-level errors (404, 403)
4. **Loading States:** To prevent user confusion during async operations

## Testing Strategy

### Unit Tests

Unit tests will focus on specific examples, edge cases, and error conditions:

1. **API Service Tests:**
   - Test successful API calls with mocked responses
   - Test error handling for different HTTP status codes
   - Test token inclusion in authenticated requests
   - Test localStorage operations

2. **Context Tests:**
   - Test context state updates after operations
   - Test error state management
   - Test loading state transitions
   - Test context provider initialization

3. **Component Tests:**
   - Test form submissions with valid/invalid data
   - Test conditional rendering based on auth state
   - Test error message display
   - Test loading indicators

4. **Route Protection Tests:**
   - Test redirect for unauthenticated users
   - Test redirect for non-admin users on admin routes
   - Test successful rendering for authorized users

### Property-Based Tests

Property-based tests will verify universal properties across all inputs using **fast-check** library (minimum 100 iterations per test):

1. **Authentication Properties:**
   - Property 1: Registration Token Storage
   - Property 2: Login Context Update
   - Property 3: Logout State Cleanup
   - Property 4: Session Restoration

2. **Product Management Properties:**
   - Property 5: Product Search by Code
   - Property 6: Admin Product Creation with Token
   - Property 7: Product Update Synchronization
   - Property 8: Product Deletion Removal
   - Property 9: Non-Admin Access Denial

3. **Cart Management Properties:**
   - Property 10: Add to Cart Context Update
   - Property 11: Cart Quantity Synchronization
   - Property 12: Cart Item Removal
   - Property 13: Clear Cart Idempotence
   - Property 14: Cart Restoration on Load
   - Property 15: Stock Validation Prevention

4. **Error Handling Properties:**
   - Property 16: Backend Error Message Display

5. **Route Protection Properties:**
   - Property 17: Unauthenticated Route Redirect
   - Property 18: Non-Admin Route Redirect
   - Property 19: Authenticated Route Access
   - Property 20: Admin Route Access

6. **State Synchronization Properties:**
   - Property 21: Cart Counter Synchronization

### Test Configuration

**Property-Based Testing Setup:**
```typescript
import fc from 'fast-check';

// Each property test should run minimum 100 iterations
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Test implementation
  }),
  { numRuns: 100 }
);
```

**Test Tags:**
Each property test must include a comment tag:
```typescript
// Feature: backend-frontend-integration, Property 1: Registration Token Storage
```

### Integration Testing

Integration tests will verify the complete flow from UI to backend:

1. **End-to-End Authentication Flow:**
   - Register → Login → Access Protected Route → Logout

2. **Product Management Flow:**
   - Admin Login → Create Product → Update Product → Delete Product

3. **Shopping Flow:**
   - Login → Browse Products → Add to Cart → Update Quantity → Remove Item → Clear Cart

### Testing Balance

- **Unit tests:** Focus on specific examples and edge cases
- **Property tests:** Verify universal properties across many inputs
- Both approaches are complementary and necessary for comprehensive coverage
- Property tests handle covering lots of inputs, so avoid writing too many unit tests for the same scenarios

