# PowerFit Backend API

Backend RESTful para el sistema de ecommerce PowerFit, construido con Node.js, Express, TypeScript y SQLite.

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/          # Configuración (DB, env)
│   ├── controllers/     # Controladores de rutas
│   ├── middleware/      # Middleware personalizado
│   ├── routes/          # Definición de rutas
│   ├── schemas/         # Schemas de validación (Zod)
│   ├── utils/           # Utilidades (auth, errors)
│   ├── app.ts           # Configuración de Express
│   └── server.ts        # Punto de entrada
├── .env                 # Variables de entorno
├── .env.example         # Ejemplo de variables
└── tsconfig.json        # Configuración TypeScript
```

## 🚀 Inicio Rápido

### Instalar dependencias (ya instaladas):
```bash
npm install
```

### Iniciar servidor de desarrollo:
```bash
npm run server
```

El servidor estará disponible en: **http://localhost:3000**

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
