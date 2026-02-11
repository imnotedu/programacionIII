# Requirements Document

## Introduction

Este documento define los requisitos para conectar el backend existente (Node.js + Express + SQLite) con el frontend (React + TypeScript) de la aplicación PowerFit. El backend ya está completamente funcional con autenticación JWT, CRUD de productos y gestión de carrito. El objetivo es integrar todos los componentes del frontend para que consuman los endpoints del backend y proporcionen una experiencia de usuario completa.

## Glossary

- **Frontend**: Aplicación React con TypeScript que proporciona la interfaz de usuario
- **Backend**: Servidor Node.js con Express que expone una API REST
- **API_Service**: Módulos de servicio que encapsulan las llamadas HTTP al backend
- **AuthContext**: Contexto de React que gestiona el estado de autenticación global
- **ProductContext**: Contexto de React que gestiona el estado de productos
- **CartContext**: Contexto de React que gestiona el estado del carrito
- **JWT_Token**: Token de autenticación JSON Web Token almacenado en localStorage
- **Protected_Route**: Componente que protege rutas requiriendo autenticación
- **Admin_Route**: Componente que protege rutas requiriendo nivel de administrador

## Requirements

### Requirement 1: Integración de Autenticación

**User Story:** Como usuario, quiero poder registrarme e iniciar sesión en la aplicación, para que pueda acceder a funcionalidades protegidas y gestionar mi carrito de compras.

#### Acceptance Criteria

1. WHEN un usuario completa el formulario de registro con datos válidos, THE Frontend SHALL enviar los datos al backend y almacenar el JWT_Token recibido
2. WHEN un usuario completa el formulario de login con credenciales válidas, THE Frontend SHALL autenticar al usuario y actualizar el AuthContext con los datos del usuario
3. WHEN un usuario cierra sesión, THE Frontend SHALL eliminar el JWT_Token del localStorage y limpiar el estado del AuthContext
4. WHEN un JWT_Token existe en localStorage al cargar la aplicación, THE Frontend SHALL validar el token con el backend y restaurar la sesión del usuario
5. WHEN una petición al backend falla con error 401, THE Frontend SHALL cerrar la sesión automáticamente y redirigir al login

### Requirement 2: Gestión de Productos

**User Story:** Como usuario, quiero ver el catálogo de productos disponibles, para que pueda explorar y seleccionar productos para comprar.

#### Acceptance Criteria

1. WHEN la página de tienda se carga, THE Frontend SHALL obtener todos los productos del backend y mostrarlos en la interfaz
2. WHEN un usuario busca un producto por código, THE Frontend SHALL consultar el backend y mostrar el producto encontrado
3. WHEN los datos de productos se actualizan en el backend, THE Frontend SHALL reflejar los cambios al recargar la lista
4. WHEN ocurre un error al cargar productos, THE Frontend SHALL mostrar un mensaje de error apropiado al usuario

### Requirement 3: Administración de Productos

**User Story:** Como administrador, quiero gestionar el catálogo de productos (crear, editar, eliminar), para que pueda mantener actualizada la oferta de la tienda.

#### Acceptance Criteria

1. WHEN un administrador crea un nuevo producto con datos válidos, THE Frontend SHALL enviar los datos al backend incluyendo el JWT_Token en los headers
2. WHEN un administrador actualiza un producto existente, THE Frontend SHALL enviar los cambios al backend y actualizar la vista local
3. WHEN un administrador elimina un producto, THE Frontend SHALL enviar la petición al backend y remover el producto de la lista local
4. WHEN un usuario no administrador intenta acceder a funciones de administración, THE Frontend SHALL denegar el acceso y mostrar un mensaje apropiado
5. WHEN una operación de administración falla por permisos insuficientes, THE Frontend SHALL mostrar un mensaje de error claro

### Requirement 4: Gestión del Carrito

**User Story:** Como usuario autenticado, quiero agregar productos a mi carrito y gestionar las cantidades, para que pueda preparar mi compra.

#### Acceptance Criteria

1. WHEN un usuario autenticado agrega un producto al carrito, THE Frontend SHALL enviar la petición al backend con el JWT_Token y actualizar el CartContext
2. WHEN un usuario actualiza la cantidad de un producto en el carrito, THE Frontend SHALL sincronizar el cambio con el backend
3. WHEN un usuario elimina un producto del carrito, THE Frontend SHALL enviar la petición al backend y actualizar la vista local
4. WHEN un usuario limpia todo el carrito, THE Frontend SHALL enviar la petición al backend y vaciar el CartContext
5. WHEN un usuario autenticado carga la aplicación, THE Frontend SHALL obtener el carrito del backend y restaurar el estado en el CartContext
6. WHEN un producto en el carrito no tiene stock suficiente, THE Frontend SHALL mostrar un mensaje de error y prevenir la operación

### Requirement 5: Manejo de Errores y Feedback

**User Story:** Como usuario, quiero recibir retroalimentación clara sobre el estado de mis acciones, para que pueda entender qué está sucediendo en la aplicación.

#### Acceptance Criteria

1. WHEN una petición al backend está en progreso, THE Frontend SHALL mostrar un indicador de carga apropiado
2. WHEN una operación se completa exitosamente, THE Frontend SHALL mostrar un mensaje de confirmación al usuario
3. WHEN ocurre un error de red, THE Frontend SHALL mostrar un mensaje indicando problemas de conexión
4. WHEN el backend retorna un error de validación, THE Frontend SHALL mostrar los mensajes de error específicos al usuario
5. WHEN el backend no está disponible, THE Frontend SHALL mostrar un mensaje indicando que el servicio no está disponible

### Requirement 6: Persistencia de Sesión

**User Story:** Como usuario, quiero que mi sesión persista entre recargas de página, para que no tenga que iniciar sesión cada vez que abro la aplicación.

#### Acceptance Criteria

1. WHEN un usuario inicia sesión exitosamente, THE Frontend SHALL almacenar el JWT_Token y datos del usuario en localStorage
2. WHEN la aplicación se recarga, THE Frontend SHALL verificar si existe un JWT_Token válido y restaurar la sesión
3. WHEN el JWT_Token expira, THE Frontend SHALL cerrar la sesión y solicitar al usuario que inicie sesión nuevamente
4. WHEN un usuario cierra sesión, THE Frontend SHALL limpiar todos los datos de sesión del localStorage

### Requirement 7: Protección de Rutas

**User Story:** Como desarrollador, quiero proteger rutas que requieren autenticación o permisos de administrador, para que solo usuarios autorizados puedan acceder a ellas.

#### Acceptance Criteria

1. WHEN un usuario no autenticado intenta acceder a una ruta protegida, THE Frontend SHALL redirigir al usuario a la página de login
2. WHEN un usuario autenticado pero no administrador intenta acceder a una ruta de administrador, THE Frontend SHALL redirigir al usuario a una página de acceso denegado
3. WHEN un usuario autenticado accede a una ruta protegida, THE Frontend SHALL permitir el acceso y renderizar el componente
4. WHEN un administrador accede a una ruta de administrador, THE Frontend SHALL permitir el acceso completo

### Requirement 8: Sincronización de Estado

**User Story:** Como usuario, quiero que los cambios en productos y carrito se reflejen inmediatamente en toda la aplicación, para que tenga una experiencia consistente.

#### Acceptance Criteria

1. WHEN un producto se actualiza en el backend, THE Frontend SHALL actualizar todas las vistas que muestran ese producto
2. WHEN el carrito se modifica, THE Frontend SHALL actualizar el contador de items en el navbar y la vista del carrito
3. WHEN un usuario agrega un producto al carrito desde la tienda, THE Frontend SHALL actualizar el estado global del carrito
4. WHEN múltiples componentes dependen del mismo estado, THE Frontend SHALL mantener la consistencia usando contextos de React

