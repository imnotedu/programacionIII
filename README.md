# 🏋️ PowerFit - Tienda de Suplementos Deportivos

![PowerFit](https://img.shields.io/badge/PowerFit-Ecommerce-orange?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-blue?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)

## 📋 Descripción

PowerFit es una plataforma de comercio electrónico especializada en la venta de suplementos deportivos de alta calidad. La aplicación permite a los usuarios explorar productos, gestionar su carrito de compras y realizar compras de manera segura. Incluye un panel de administración completo para la gestión de inventario.

### ✨ Características Principales

- 🛍️ **Catálogo de Productos**: Navegación intuitiva con búsqueda en tiempo real y filtros por categoría
- 🛒 **Carrito de Compras**: Gestión completa del carrito con actualización en tiempo real
- 💳 **Proceso de Pago**: Simulación de pago con validaciones realistas
- 👤 **Sistema de Autenticación**: Registro, login y gestión de sesiones
- 🔐 **Panel de Administración**: CRUD completo de productos con gestión de stock
- 📱 **Diseño Responsive**: Optimizado para desktop, tablet y móvil
- 🎨 **UI Moderna**: Interfaz limpia con Tailwind CSS y animaciones suaves

## 🔑 Credenciales de Acceso

### Administrador (Superadmin)
```
Email: admin@powerfit.com
Contraseña: 1234567
```

**Permisos del Administrador:**
- ✅ Crear, editar y eliminar productos
- ✅ Gestionar inventario y stock
- ✅ Asignar códigos únicos a productos
- ✅ Subir y gestionar imágenes de productos
- ✅ Acceso completo al panel de administración

### Usuario Regular
Los usuarios pueden registrarse libremente en `/register` con:
- Nombre completo
- Email válido
- Contraseña (mínimo 6 caracteres)

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** v18+ - Entorno de ejecución
- **Express.js** v4.x - Framework web
- **TypeScript** v5.x - Tipado estático
- **PostgreSQL** v15+ - Base de datos relacional
- **Prisma ORM** - ORM para PostgreSQL
- **Express Session** - Gestión de sesiones
- **Bcrypt** - Hash de contraseñas
- **Multer** - Subida de archivos
- **EJS** - Motor de plantillas

### Frontend
- **Tailwind CSS** v3.x - Framework CSS
- **JavaScript Vanilla** - Interactividad del cliente
- **EJS Templates** - Renderizado del lado del servidor

### Herramientas de Desarrollo
- **Nodemon** - Recarga automática en desarrollo
- **TS-Node** - Ejecución de TypeScript
- **ESLint** - Linter de código
- **Prettier** - Formateador de código

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js v18 o superior
- PostgreSQL v15 o superior
- npm o yarn

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd fitness-fuel-store
```

### 2. Instalar Dependencias
```bash
cd backend
npm install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la carpeta `backend`:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/powerfit_db"

# Sesión
SESSION_SECRET="tu-secret-key-super-seguro-aqui"

# Servidor
PORT=3000
NODE_ENV=development
```

### 4. Configurar Base de Datos
```bash
# Crear base de datos
createdb powerfit_db

# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate

# Seed de datos (opcional - crea admin y productos de prueba)
npx prisma db seed
```

### 5. Iniciar el Servidor
```bash
# Modo desarrollo (con recarga automática)
npm run dev

# Modo producción
npm run build
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
fitness-fuel-store/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuraciones (DB, sesión)
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middlewares (auth, upload)
│   │   ├── routes/          # Rutas de la API
│   │   ├── utils/           # Utilidades (auth, validación)
│   │   ├── app.ts           # Configuración de Express
│   │   └── server.ts        # Punto de entrada
│   ├── views/
│   │   ├── layouts/         # Layouts principales
│   │   ├── pages/           # Páginas de la aplicación
│   │   └── partials/        # Componentes reutilizables
│   ├── public/
│   │   ├── css/             # Estilos
│   │   ├── js/              # Scripts del cliente
│   │   └── uploads/         # Imágenes subidas
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema de la base de datos
│   │   └── seed.ts          # Datos de prueba
│   └── package.json
└── README.md
```

## 🎯 Funcionalidades Detalladas

### Para Usuarios

#### 1. Navegación y Búsqueda
- Búsqueda en tiempo real con autocompletado
- Filtrado por categorías (Proteínas, Pre-entreno, Aminoácidos, Vitaminas)
- Vista de productos populares en la homepage
- Scroll suave a secciones

#### 2. Gestión del Carrito
- Agregar productos desde cualquier página
- Actualización de cantidades en tiempo real
- Contador de items en el navbar
- Validación de stock disponible
- Persistencia del carrito en sesión

#### 3. Proceso de Compra
- Formulario de checkout con validaciones
- Simulación de pago con tarjeta de crédito
- Validaciones realistas:
  - Número de tarjeta (16 dígitos)
  - Fecha de expiración (MM/YY)
  - CVC (3-4 dígitos)
  - Código postal (4-5 dígitos)
- Confirmación de compra
- Descuento automático de stock

#### 4. Autenticación
- Registro de nuevos usuarios
- Login con email y contraseña
- Sesiones persistentes
- Logout seguro

### Para Administradores

#### 1. Gestión de Productos
- **Crear productos** con:
  - Nombre y descripción
  - Precio
  - Categoría
  - Stock inicial
  - Código único (auto-uppercase)
  - Imagen del producto
- **Editar productos** existentes
- **Eliminar productos**
- **Vista previa** de imagen al subir

#### 2. Control de Inventario
- Visualización de stock con indicadores de color:
  - 🔴 Rojo: Stock = 0 (agotado)
  - 🟡 Amarillo: Stock < 10 (bajo)
  - 🟢 Verde: Stock >= 10 (disponible)
- Códigos únicos para cada producto
- Actualización de stock en tiempo real

#### 3. Panel de Administración
- Acceso exclusivo para usuarios admin
- Interfaz intuitiva y responsive
- Modal compacto para edición rápida
- Validaciones en formularios

## 🌐 Rutas Principales

### Públicas
- `/` - Homepage con productos populares
- `/tienda` - Catálogo completo de productos
- `/producto/:id` - Detalle de producto
- `/login` - Inicio de sesión
- `/register` - Registro de usuario

### Protegidas (Requieren autenticación)
- `/carrito` - Carrito de compras
- `/checkout` - Proceso de pago
- `/admin-products` - Panel de administración (solo admin)

### API Endpoints
- `GET /api/products` - Listar productos
- `GET /api/products/search?q=texto` - Buscar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)
- `POST /api/cart/add` - Agregar al carrito
- `POST /api/cart/checkout` - Procesar pago
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary**: Naranja vibrante (#FF6B35)
- **Background**: Gris oscuro (#1A1A1A)
- **Foreground**: Blanco (#FFFFFF)
- **Muted**: Gris medio (#6B7280)

### Características de Diseño
- Animaciones suaves y transiciones
- Efectos hover en botones y cards
- Scroll suave entre secciones
- Indicadores visuales de estado
- Feedback inmediato en acciones
- Diseño mobile-first

## 🧪 Testing

### Datos de Prueba
El seed incluye:
- 1 usuario administrador
- 20 productos de ejemplo en 4 categorías
- Stock variado para pruebas

### Probar la Aplicación
1. Iniciar sesión como admin
2. Crear/editar productos
3. Navegar como usuario regular
4. Agregar productos al carrito
5. Completar proceso de checkout
6. Verificar descuento de stock

## 🚀 Despliegue en Producción

### Variables de Entorno (Render/Heroku)
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=tu-secret-produccion
NODE_ENV=production
PORT=3000
```

### Comandos de Build
```bash
# Build
npm install
npm run build

# Start
npm start
```

### Checklist Pre-Despliegue
- ✅ Variables de entorno configuradas
- ✅ Base de datos PostgreSQL creada
- ✅ Migraciones ejecutadas
- ✅ Seed ejecutado (opcional)
- ✅ Archivos estáticos servidos correctamente
- ✅ HTTPS habilitado
- ✅ Sesiones configuradas con secret seguro

## 📝 Notas Importantes

### Seguridad
- Las contraseñas se hashean con bcrypt
- Las sesiones usan cookies seguras
- Validación de inputs en cliente y servidor
- Protección contra inyección SQL (Prisma ORM)
- Sanitización de datos de usuario

### Limitaciones Conocidas
- El pago es simulado (no procesa pagos reales)
- Las imágenes se almacenan localmente (no en CDN)
- No hay sistema de recuperación de contraseña
- No hay notificaciones por email

### Mejoras Futuras
- Integración con pasarela de pago real
- Sistema de reviews y ratings
- Wishlist de productos
- Historial de pedidos
- Panel de analytics para admin
- Notificaciones por email
- Sistema de cupones y descuentos

## 👨‍💻 Desarrollo

### Scripts Disponibles
```bash
npm run dev          # Modo desarrollo con nodemon
npm run build        # Compilar TypeScript
npm start            # Iniciar servidor de producción
npm run prisma:studio # Abrir Prisma Studio (GUI de DB)
npm run prisma:seed  # Ejecutar seed de datos
```

### Convenciones de Código
- TypeScript estricto
- ESLint para linting
- Prettier para formateo
- Commits descriptivos
- Nombres de variables en camelCase
- Nombres de archivos en kebab-case

## 📞 Soporte

Para preguntas o problemas:
- Email: info@powerfit.com
- Teléfono: +58 412-4295661
- Ubicación: Guarico, Venezuela

## 📄 Licencia

Este proyecto fue desarrollado como parte de un proyecto académico.

---

**Desarrollado con ❤️ para PowerFit**

*Última actualización: Febrero 2026*
