# Requirements Document - Shopping Cart

## Introduction

Sistema de carrito de compras simple para PowerFit que permite a los usuarios agregar productos, actualizar cantidades y gestionar su carrito antes de realizar una compra.

## Glossary

- **Cart**: Carrito de compras asociado a un usuario específico
- **Cart_Item**: Item individual dentro del carrito (producto + cantidad)
- **User**: Usuario autenticado del sistema
- **Product**: Producto disponible en el catálogo
- **System**: Backend API de PowerFit

## Requirements

### Requirement 1: Agregar Productos al Carrito

**User Story:** Como usuario autenticado, quiero agregar productos a mi carrito, para poder acumular mis compras antes de finalizar.

#### Acceptance Criteria

1. WHEN un usuario autenticado agrega un producto al carrito THEN THE System SHALL crear o actualizar el item en el carrito
2. WHEN un usuario agrega un producto que ya existe en su carrito THEN THE System SHALL incrementar la cantidad del producto existente
3. WHEN un usuario agrega un producto con cantidad específica THEN THE System SHALL validar que la cantidad sea mayor a 0
4. WHEN un usuario agrega un producto THEN THE System SHALL verificar que el producto existe
5. WHEN un usuario no autenticado intenta agregar un producto THEN THE System SHALL rechazar la petición

### Requirement 2: Ver Carrito

**User Story:** Como usuario autenticado, quiero ver el contenido de mi carrito, para revisar los productos que voy a comprar.

#### Acceptance Criteria

1. WHEN un usuario autenticado solicita ver su carrito THEN THE System SHALL retornar todos los items del carrito con información del producto
2. WHEN un usuario solicita ver su carrito THEN THE System SHALL calcular el subtotal de cada item (precio × cantidad)
3. WHEN un usuario solicita ver su carrito THEN THE System SHALL calcular el total general del carrito
4. WHEN un usuario sin items en el carrito solicita verlo THEN THE System SHALL retornar un carrito vacío con total 0
5. WHEN un usuario no autenticado intenta ver un carrito THEN THE System SHALL rechazar la petición

### Requirement 3: Actualizar Cantidad de Productos

**User Story:** Como usuario autenticado, quiero actualizar la cantidad de productos en mi carrito, para ajustar mis compras.

#### Acceptance Criteria

1. WHEN un usuario actualiza la cantidad de un item THEN THE System SHALL validar que la cantidad sea mayor a 0
2. WHEN un usuario actualiza la cantidad de un item que existe THEN THE System SHALL actualizar la cantidad
3. WHEN un usuario actualiza la cantidad de un item que no existe THEN THE System SHALL retornar error
4. WHEN un usuario actualiza la cantidad THEN THE System SHALL actualizar el timestamp del carrito
5. WHEN un usuario no autenticado intenta actualizar un item THEN THE System SHALL rechazar la petición

### Requirement 4: Eliminar Productos del Carrito

**User Story:** Como usuario autenticado, quiero eliminar productos de mi carrito, para remover items que ya no deseo comprar.

#### Acceptance Criteria

1. WHEN un usuario elimina un item del carrito THEN THE System SHALL remover el item completamente
2. WHEN un usuario elimina un item que no existe THEN THE System SHALL retornar error
3. WHEN un usuario elimina el último item THEN THE System SHALL mantener el carrito vacío
4. WHEN un usuario no autenticado intenta eliminar un item THEN THE System SHALL rechazar la petición

### Requirement 5: Limpiar Carrito

**User Story:** Como usuario autenticado, quiero vaciar mi carrito completamente, para empezar una nueva selección de productos.

#### Acceptance Criteria

1. WHEN un usuario solicita limpiar su carrito THEN THE System SHALL eliminar todos los items del carrito
2. WHEN un usuario limpia un carrito vacío THEN THE System SHALL completar exitosamente sin error
3. WHEN un usuario no autenticado intenta limpiar un carrito THEN THE System SHALL rechazar la petición

### Requirement 6: Gestión Automática de Carritos

**User Story:** Como sistema, quiero gestionar automáticamente los carritos de usuarios, para mantener la integridad de los datos.

#### Acceptance Criteria

1. WHEN un usuario se registra THEN THE System SHALL crear automáticamente un carrito para ese usuario
2. WHEN un usuario hace login por primera vez THEN THE System SHALL crear un carrito si no existe
3. WHEN un producto es eliminado del catálogo THEN THE System SHALL eliminar ese producto de todos los carritos
4. THE System SHALL mantener un único carrito activo por usuario

### Requirement 7: Validaciones de Stock

**User Story:** Como sistema, quiero validar el stock disponible, para evitar que usuarios agreguen más productos de los disponibles.

#### Acceptance Criteria

1. WHEN un usuario agrega un producto al carrito THEN THE System SHALL verificar que hay stock disponible
2. WHEN la cantidad solicitada excede el stock THEN THE System SHALL retornar error con el stock disponible
3. WHEN un usuario actualiza la cantidad THEN THE System SHALL verificar que no exceda el stock disponible

### Requirement 8: Persistencia de Datos

**User Story:** Como usuario, quiero que mi carrito persista entre sesiones, para no perder mi selección al cerrar sesión.

#### Acceptance Criteria

1. WHEN un usuario cierra sesión THEN THE System SHALL mantener los items en el carrito
2. WHEN un usuario inicia sesión nuevamente THEN THE System SHALL retornar el carrito con los items previos
3. THE System SHALL almacenar los carritos en la base de datos SQLite
