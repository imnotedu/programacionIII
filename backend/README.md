# PowerFit Backend - EJS Server-Side Rendering

Backend para el sistema de ecommerce PowerFit, construido con Node.js, Express, EJS y SQLite. Utiliza renderizado del lado del servidor (SSR) con plantillas EJS.

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/          # Configuración (DB, sesiones, env)
│   ├── controllers/     # Controladores de rutas y vistas
│   ├── middleware/      # Middleware personalizado (auth, sesión)
│   ├── routes/          # Definición de rutas (API y vistas)
│   ├── schemas/         # Schemas de validación (Zod)
│   ├── utils/           # Utilidades (auth, errors, helpers)
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── views/
│   ├── layouts/         # Layouts principales (main.ejs, auth.ejs)
│   ├── partials/        # Componentes reutilizables (header, footer, etc.)
│   └── pages/           # Páginas completas (home, store, cart, etc.)
├── public/
│   ├── css/             # Estilos compilados (Tailwind CSS)
│   ├── js/              # JavaScript del cliente
│   ├── images/          # Imágenes estáticas
│   └── products/        # Imágenes de productos
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
└── package.json         # Dependencias y scripts
```

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=powerfit-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Sesiones
SESSION_SECRET=powerfit-session-secret-change-in-production

# CORS
CORS_ORIGIN=http://localhost:8081

# Base de Datos
DB_PATH=./powerfit.db
```

### 3. Compilar estilos CSS

```bash
npm run build:css
```

### 4. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en: **http://localhost:3000**

Para desarrollo con recarga automática de CSS, ejecuta en otra terminal:

```bash
npm run dev:css
```

## 📜 Scripts Disponibles

### Desarrollo

- **`npm run dev`** - Inicia el servidor en modo desarrollo con nodemon (recarga automática)
- **`npm run dev:css`** - Compila Tailwind CSS en modo watch (recarga automática de estilos)
- **`npm run build:css`** - Compila Tailwind CSS una vez (sin minificar)
- **`npm run build:css:watch`** - Compila Tailwind CSS en modo watch

### Producción

- **`npm run build`** - Compila TypeScript a JavaScript
- **`npm run build:css`** - Compila y minifica Tailwind CSS para producción
- **`npm start`** - Inicia el servidor en modo producción (requiere compilar primero)

### Testing

- **`npm test`** - Ejecuta los tests (pendiente de implementación)

## 🎨 Desarrollo con EJS

### Estructura de Plantillas

El proyecto usa **EJS (Embedded JavaScript)** como motor de plantillas con **express-ejs-layouts** para layouts compartidos.

#### Layouts

- **`layouts/main.ejs`** - Layout principal con header, footer y navegación
- **`layouts/auth.ejs`** - Layout simplificado para login/registro

#### Partials

Componentes reutilizables:

- **`partials/header.ejs`** - Header con navegación y carrito
- **`partials/footer.ejs`** - Footer con enlaces e información
- **`partials/product-card.ejs`** - Tarjeta de producto
- **`partials/cart-item.ejs`** - Item del carrito
- **`partials/flash-messages.ejs`** - Mensajes de éxito/error

#### Páginas

- **`pages/home.ejs`** - Página de inicio
- **`pages/store.ejs`** - Tienda con filtros
- **`pages/product-detail.ejs`** - Detalle de producto
- **`pages/cart.ejs`** - Carrito de compras
- **`pages/checkout.ejs`** - Checkout (protegida)
- **`pages/favorites.ejs`** - Favoritos
- **`pages/login.ejs`** - Inicio de sesión
- **`pages/register.ejs`** - Registro
- **`pages/admin-product.ejs`** - Panel de administración (admin)
- **`pages/access-denied.ejs`** - Acceso denegado
- **`pages/not-found.ejs`** - 404

### Variables Locales Globales

Todas las plantillas tienen acceso a estas variables:

```javascript
{
  user: { id, email, name, isAdmin } | null,
  isAuthenticated: boolean,
  cartCount: number,
  success: string[],  // Mensajes flash de éxito
  error: string[],    // Mensajes flash de error
  currentPath: string,
  title: string
}
```

### Ejemplo de Uso de Partials

```ejs
<!-- Incluir un partial sin datos -->
<%- include('../partials/header') %>

<!-- Incluir un partial con datos -->
<%- include('../partials/product-card', { product: product }) %>

<!-- Iterar y renderizar partials -->
<% products.forEach(product => { %>
  <%- include('../partials/product-card', { product: product }) %>
<% }) %>
```

## 🔐 Autenticación y Sesiones

El backend usa **express-session** para gestión de sesiones del lado del servidor y **JWT** para la API REST.

### Flujo de Autenticación (Vistas EJS)

1. Usuario envía formulario de login/registro
2. Backend valida credenciales
3. Backend almacena usuario en la sesión
4. Usuario es redirigido a la página apropiada
5. Sesión persiste entre peticiones (cookie)

### Flujo de Autenticación (API REST)

1. Cliente envía credenciales a `/api/auth/login`
2. Backend genera token JWT
3. Cliente guarda el token
4. Cliente envía el token en el header `Authorization: Bearer <token>`

### Middleware de Protección

- **`requireAuth`** - Requiere usuario autenticado
- **`requireAdmin`** - Requiere usuario con rol admin
- **`redirectIfAuth`** - Redirige si ya está autenticado (para login/register)

### Superadmin Predefinido

```
Usuario: admin
Contraseña: 1234567
Nivel: admin
```

## 🛒 Gestión del Carrito

El carrito se almacena en la **sesión del servidor** para usuarios autenticados y en **cookies** para usuarios anónimos.

### Estructura del Carrito en Sesión

```javascript
req.session.cart = [
  {
    productId: "prod-123",
    quantity: 2
  }
]
```

### API del Carrito

- **POST `/api/cart/add`** - Agregar producto al carrito
- **PUT `/api/cart/update`** - Actualizar cantidad
- **DELETE `/api/cart/remove`** - Eliminar producto
- **DELETE `/api/cart/clear`** - Vaciar carrito

### JavaScript del Cliente

El archivo `public/js/cart.js` maneja las interacciones del carrito sin recargar la página:

- Agregar al carrito (AJAX)
- Actualizar cantidad (AJAX)
- Eliminar del carrito (AJAX)
- Actualizar contador en el header

## ⭐ Gestión de Favoritos

Los favoritos se almacenan en la **sesión del servidor**.

### Estructura de Favoritos en Sesión

```javascript
req.session.favorites = ["prod-123", "prod-456"]
```

### API de Favoritos

- **POST `/api/favorites/add`** - Agregar a favoritos
- **DELETE `/api/favorites/remove`** - Remover de favoritos

## 🎨 Estilos con Tailwind CSS

El proyecto usa **Tailwind CSS** con configuración personalizada.

### Compilar Estilos

```bash
# Compilar una vez
npm run build:css

# Compilar en modo watch (desarrollo)
npm run dev:css
```

### Archivo de Entrada

- **`src/index.css`** - Archivo fuente con directivas de Tailwind y estilos personalizados

### Archivo de Salida

- **`public/css/styles.css`** - CSS compilado (incluido en layouts)

### Configuración

- **`tailwind.config.ts`** - Configuración de Tailwind (colores, fuentes, etc.)

## 📚 Rutas Disponibles

### Páginas Públicas

- **GET `/`** - Página de inicio
- **GET `/tienda`** - Tienda con filtros
- **GET `/producto/:id`** - Detalle de producto
- **GET `/carrito`** - Carrito de compras
- **GET `/favoritos`** - Favoritos
- **GET `/login`** - Inicio de sesión
- **GET `/register`** - Registro

### Páginas Protegidas

- **GET `/checkout`** - Checkout (requiere autenticación)
- **GET `/admin-products`** - Panel de administración (requiere admin)

### Páginas de Error

- **GET `/access-denied`** - Acceso denegado (403)
- **GET `/*`** - Página no encontrada (404)

## 📚 Endpoints Disponibles

### Autenticación

#### POST /api/auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-1234567890",
      "email": "juan@example.com",
      "name": "Juan Pérez",
      "level": "usuario"
    }
  }
}
```

#### POST /api/auth/login
Inicia sesión con un usuario existente.

**Body:**
```json
{
  "email": "admin",
  "password": "1234567"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "superadmin-001",
      "email": "admin",
      "name": "Administrador del Sistema",
      "level": "admin"
    }
  }
}
```

#### GET /api/auth/me
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-1234567890",
      "email": "juan@example.com",
      "name": "Juan Pérez",
      "level": "usuario",
      "createdAt": "2026-02-07T20:00:00.000Z"
    }
  }
}
```

### Productos

#### GET /api/products
Obtiene todos los productos (público).

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-1234567890",
        "name": "Proteína Whey",
        "code": "PROT-001",
        "price": 45.99,
        "description": "Proteína de alta calidad",
        "category": "Proteínas",
        "imageUrl": null,
        "stock": 100,
        "createdAt": "2026-02-07T20:00:00.000Z",
        "updatedAt": "2026-02-07T20:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

#### GET /api/products/code/:code
Obtiene un producto por código (público).

**Parámetros:**
- `code`: Código del producto (ej: PROT-001)

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-1234567890",
      "name": "Proteína Whey",
      "code": "PROT-001",
      "price": 45.99,
      "description": "Proteína de alta calidad",
      "category": "Proteínas",
      "imageUrl": null,
      "stock": 100,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:00:00.000Z"
    }
  }
}
```

#### GET /api/products/:id
Obtiene un producto por ID (público).

**Parámetros:**
- `id`: ID del producto

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-1234567890",
      "name": "Proteína Whey",
      "code": "PROT-001",
      "price": 45.99,
      "description": "Proteína de alta calidad",
      "category": "Proteínas",
      "imageUrl": null,
      "stock": 100,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:00:00.000Z"
    }
  }
}
```

#### POST /api/products
Crea un nuevo producto (requiere autenticación + admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Proteína Whey",
  "code": "PROT-001",
  "price": 45.99,
  "description": "Proteína de alta calidad",
  "category": "Proteínas",
  "imageUrl": "https://example.com/image.jpg",
  "stock": 100
}
```

**Validaciones:**
- `name`: Requerido, mínimo 2 caracteres
- `code`: Requerido, único, formato alfanumérico con guiones
- `price`: Requerido, mayor a 0
- `category`: Requerido
- `stock`: Requerido, mayor o igual a 0
- `description`: Opcional
- `imageUrl`: Opcional, debe ser URL válida

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-1234567890",
      "name": "Proteína Whey",
      "code": "PROT-001",
      "price": 45.99,
      "description": "Proteína de alta calidad",
      "category": "Proteínas",
      "imageUrl": "https://example.com/image.jpg",
      "stock": 100,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:00:00.000Z"
    }
  }
}
```

#### PUT /api/products/:id
Actualiza un producto (requiere autenticación + admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Body (todos los campos son opcionales):**
```json
{
  "name": "Proteína Whey Premium",
  "price": 49.99,
  "stock": 150
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-1234567890",
      "name": "Proteína Whey Premium",
      "code": "PROT-001",
      "price": 49.99,
      "description": "Proteína de alta calidad",
      "category": "Proteínas",
      "imageUrl": "https://example.com/image.jpg",
      "stock": 150,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:05:00.000Z"
    }
  }
}
```

#### DELETE /api/products/:id
Elimina un producto (requiere autenticación + admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

### Carrito

#### GET /api/cart
Obtiene el carrito del usuario autenticado (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart-1234567890",
      "userId": "user-1234567890",
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:05:00.000Z"
    },
    "items": [
      {
        "id": "item-1234567890",
        "cartId": "cart-1234567890",
        "productId": "prod-1234567890",
        "quantity": 2,
        "createdAt": "2026-02-07T20:00:00.000Z",
        "updatedAt": "2026-02-07T20:00:00.000Z",
        "product": {
          "id": "prod-1234567890",
          "name": "Proteína Whey",
          "code": "PROT-001",
          "price": 45.99,
          "description": "Proteína de alta calidad",
          "category": "Proteínas",
          "imageUrl": null,
          "stock": 100
        },
        "subtotal": 91.98
      }
    ],
    "total": 91.98,
    "itemCount": 1
  }
}
```

#### POST /api/cart/items
Agrega un producto al carrito (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "productId": "prod-1234567890",
  "quantity": 2
}
```

**Validaciones:**
- `productId`: Requerido, debe existir en productos
- `quantity`: Requerido, entero positivo, máximo 1000
- Stock disponible debe ser suficiente

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-1234567890",
      "cartId": "cart-1234567890",
      "productId": "prod-1234567890",
      "quantity": 2,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:00:00.000Z"
    }
  },
  "message": "Producto agregado al carrito"
}
```

**Nota:** Si el producto ya existe en el carrito, se incrementa la cantidad.

#### PUT /api/cart/items/:productId
Actualiza la cantidad de un producto en el carrito (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "quantity": 5
}
```

**Validaciones:**
- `quantity`: Requerido, entero positivo, máximo 1000
- Stock disponible debe ser suficiente

**Respuesta (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "item-1234567890",
      "cartId": "cart-1234567890",
      "productId": "prod-1234567890",
      "quantity": 5,
      "createdAt": "2026-02-07T20:00:00.000Z",
      "updatedAt": "2026-02-07T20:05:00.000Z"
    }
  },
  "message": "Cantidad actualizada"
}
```

#### DELETE /api/cart/items/:productId
Elimina un producto del carrito (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Producto eliminado del carrito"
}
```

#### DELETE /api/cart
Limpia el carrito completo (requiere autenticación).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Carrito vaciado exitosamente"
}
```

### Health Check

#### GET /api/health
Verifica el estado del servidor.

**Respuesta (200):**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2026-02-07T20:00:00.000Z"
}
```

## 🔐 Autenticación

El backend usa **JWT (JSON Web Tokens)** para autenticación.

### Flujo de autenticación:
1. Usuario se registra o inicia sesión
2. Backend genera un token JWT
3. Cliente guarda el token
4. Cliente envía el token en el header `Authorization: Bearer <token>`
5. Backend valida el token en rutas protegidas

### Superadmin predefinido:
```
Usuario: admin
Contraseña: 1234567
Nivel: admin
```

## 🛡️ Seguridad

### Implementaciones de seguridad:
- ✅ Contraseñas hasheadas con bcrypt (10 salt rounds)
- ✅ Tokens JWT con expiración (24 horas)
- ✅ Validación de datos con Zod
- ✅ CORS configurado
- ✅ Manejo centralizado de errores
- ✅ Middleware de autenticación
- ✅ Middleware de autorización (admin)

## 📦 Base de Datos

### SQLite
- Archivo: `powerfit.db`
- Ubicación: Raíz del proyecto
- Se crea automáticamente al iniciar el servidor

### Tablas:

#### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK(level IN ('admin', 'usuario')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

#### products
```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  price REAL NOT NULL CHECK(price > 0),
  description TEXT,
  category TEXT NOT NULL,
  imageUrl TEXT,
  stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

#### carts
```sql
CREATE TABLE carts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
)
```

#### cart_items
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

## 🔧 Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development

# JWT Secret (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=powerfit-secret-key-dev-2026
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:8081

# Base de datos
DB_PATH=./powerfit.db
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch
```

## 📝 Buenas Prácticas Implementadas

1. **Arquitectura en capas**
   - Controladores
   - Servicios (utils)
   - Middleware
   - Rutas

2. **Manejo de errores**
   - Clases de error personalizadas
   - Middleware centralizado
   - Respuestas consistentes

3. **Validación de datos**
   - Schemas con Zod
   - Validación en controladores

4. **Seguridad**
   - Autenticación JWT
   - Autorización por roles
   - Contraseñas hasheadas

5. **Código limpio**
   - TypeScript estricto
   - Comentarios en español
   - Nombres descriptivos

6. **Configuración**
   - Variables de entorno
   - Configuración centralizada

## 🚧 Próximas Funcionalidades

- [x] CRUD de productos ✅
- [x] Gestión de carrito ✅
- [ ] Órdenes de compra
- [ ] Historial de compras
- [ ] Gestión de usuarios (admin)
- [ ] Paginación
- [ ] Filtros y búsqueda
- [ ] Rate limiting
- [ ] Logging avanzado

## ✅ Estado Actual

### Completado:
- ✅ Autenticación con JWT
- ✅ Registro de usuarios
- ✅ Login de usuarios
- ✅ Superadmin predefinido
- ✅ CRUD completo de productos
- ✅ CRUD completo de carrito
- ✅ Validaciones con Zod
- ✅ Autorización por roles (admin/usuario)
- ✅ Manejo de errores centralizado
- ✅ Base de datos SQLite
- ✅ CORS configurado
- ✅ Pruebas de endpoints exitosas

### Evaluaciones del Profesor:
- ✅ **Evaluación 2: Login Básico** - Completado
  - Registro de usuarios
  - Login con token JWT
  - Contraseñas encriptadas con bcrypt
  - Perfil de usuario autenticado
  
- ✅ **Evaluación 3: Productos** - Completado
  - CRUD completo de productos
  - Ver todos los productos (público)
  - Ver producto por código (público)
  - Solo admin puede crear/actualizar/eliminar
  - Validaciones de precio > 0 y código único
  
- ✅ **Evaluación 4: Carrito Simple** - Completado
  - Ver carrito con totales calculados
  - Agregar productos al carrito
  - Actualizar cantidades
  - Eliminar productos del carrito
  - Limpiar carrito completo
  - Validaciones de stock
  - Persistencia entre sesiones
  - Cálculo automático de subtotales y total

## 📄 Licencia

Proyecto universitario - PowerFit 2026
