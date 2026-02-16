#!/bin/bash

# Script de Pruebas de Endpoints - PowerFit
# Este script prueba todos los endpoints requeridos por el PDF de evaluación

echo "🧪 Iniciando pruebas de endpoints de PowerFit..."
echo ""

BASE_URL="http://localhost:3000"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Variables para tokens
ADMIN_TOKEN=""
USER_TOKEN=""
PRODUCT_ID=""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 EVALUACIÓN 2: LOGIN BÁSICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Registro de usuario
echo "Test 1: Registro de nuevo usuario"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario de Prueba",
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    USER_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_result 0 "Registro exitoso - Token obtenido"
else
    print_result 1 "Registro falló"
    echo "Respuesta: $RESPONSE"
fi
echo ""

# Test 2: Login con superadmin
echo "Test 2: Login con superadmin"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@powerfit.com",
    "password": "1234567"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    ADMIN_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    print_result 0 "Login de admin exitoso - Token obtenido"
else
    print_result 1 "Login de admin falló"
    echo "Respuesta: $RESPONSE"
fi
echo ""

# Test 3: Obtener perfil de usuario
echo "Test 3: Obtener perfil de usuario autenticado"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Perfil obtenido correctamente"
else
    print_result 1 "Obtener perfil falló"
    echo "Respuesta: $RESPONSE"
fi
echo ""

# Test 4: Login con credenciales inválidas
echo "Test 4: Login con credenciales inválidas (debe fallar)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noexiste@example.com",
    "password": "wrongpassword"
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
    print_result 0 "Rechazo de credenciales inválidas correcto"
else
    print_result 1 "Debería rechazar credenciales inválidas"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 EVALUACIÓN 3: PRODUCTOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 5: Ver todos los productos (público)
echo "Test 5: Ver todos los productos (sin autenticación)"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/products")

if echo "$RESPONSE" | grep -q '"success":true'; then
    PRODUCT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    print_result 0 "Listado de productos exitoso"
else
    print_result 1 "Listado de productos falló"
fi
echo ""

# Test 6: Ver producto por código (público)
echo "Test 6: Ver producto por código (sin autenticación)"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/products/code/ON-WH-001")

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Obtener producto por código exitoso"
else
    print_result 1 "Obtener producto por código falló"
fi
echo ""

# Test 7: Ver producto por ID (público)
echo "Test 7: Ver producto por ID (sin autenticación)"
if [ -n "$PRODUCT_ID" ]; then
    RESPONSE=$(curl -s -X GET "$BASE_URL/api/products/$PRODUCT_ID")
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Obtener producto por ID exitoso"
    else
        print_result 1 "Obtener producto por ID falló"
    fi
else
    print_result 1 "No se pudo obtener ID de producto"
fi
echo ""

# Test 8: Crear producto como admin
echo "Test 8: Crear producto como admin"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto de Prueba",
    "code": "TEST-'$(date +%s)'",
    "price": 29.99,
    "description": "Producto creado en prueba automatizada",
    "category": "Proteínas",
    "stock": 10
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Creación de producto como admin exitosa"
else
    print_result 1 "Creación de producto como admin falló"
    echo "Respuesta: $RESPONSE"
fi
echo ""

# Test 9: Intentar crear producto como usuario normal (debe fallar)
echo "Test 9: Intentar crear producto como usuario normal (debe fallar)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto No Autorizado",
    "code": "NOAUTH-001",
    "price": 29.99,
    "description": "Este producto no debería crearse",
    "category": "Proteínas",
    "stock": 10
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
    print_result 0 "Rechazo de creación por usuario normal correcto"
else
    print_result 1 "Debería rechazar creación por usuario normal"
fi
echo ""

# Test 10: Validación de precio (debe fallar con precio 0)
echo "Test 10: Validación de precio > 0 (debe fallar)"
RESPONSE=$(curl -s -X POST "$BASE_URL/api/products" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Precio Inválido",
    "code": "INVALID-001",
    "price": 0,
    "description": "Precio inválido",
    "category": "Proteínas",
    "stock": 10
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
    print_result 0 "Validación de precio correcto"
else
    print_result 1 "Debería rechazar precio <= 0"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛒 EVALUACIÓN 4: CARRITO SIMPLE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 11: Ver carrito vacío
echo "Test 11: Ver carrito vacío"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/cart" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Obtener carrito exitoso"
else
    print_result 1 "Obtener carrito falló"
fi
echo ""

# Test 12: Agregar producto al carrito
echo "Test 12: Agregar producto al carrito"
if [ -n "$PRODUCT_ID" ]; then
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/cart/items" \
      -H "Authorization: Bearer $USER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "productId": "'$PRODUCT_ID'",
        "quantity": 2
      }')
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Agregar producto al carrito exitoso"
    else
        print_result 1 "Agregar producto al carrito falló"
        echo "Respuesta: $RESPONSE"
    fi
else
    print_result 1 "No se pudo agregar producto (ID no disponible)"
fi
echo ""

# Test 13: Ver carrito con productos y total calculado
echo "Test 13: Ver carrito con productos y total calculado"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/cart" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$RESPONSE" | grep -q '"total"'; then
    print_result 0 "Carrito con total calculado correcto"
else
    print_result 1 "Total del carrito no calculado"
fi
echo ""

# Test 14: Actualizar cantidad de producto en carrito
echo "Test 14: Actualizar cantidad de producto en carrito"
if [ -n "$PRODUCT_ID" ]; then
    RESPONSE=$(curl -s -X PUT "$BASE_URL/api/cart/items/$PRODUCT_ID" \
      -H "Authorization: Bearer $USER_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "quantity": 5
      }')
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Actualizar cantidad exitoso"
    else
        print_result 1 "Actualizar cantidad falló"
    fi
else
    print_result 1 "No se pudo actualizar cantidad (ID no disponible)"
fi
echo ""

# Test 15: Eliminar producto del carrito
echo "Test 15: Eliminar producto del carrito"
if [ -n "$PRODUCT_ID" ]; then
    RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/cart/items/$PRODUCT_ID" \
      -H "Authorization: Bearer $USER_TOKEN")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        print_result 0 "Eliminar producto del carrito exitoso"
    else
        print_result 1 "Eliminar producto del carrito falló"
    fi
else
    print_result 1 "No se pudo eliminar producto (ID no disponible)"
fi
echo ""

# Test 16: Vaciar carrito completo
echo "Test 16: Vaciar carrito completo"
RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/cart" \
  -H "Authorization: Bearer $USER_TOKEN")

if echo "$RESPONSE" | grep -q '"success":true'; then
    print_result 0 "Vaciar carrito exitoso"
else
    print_result 1 "Vaciar carrito falló"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRUEBAS COMPLETADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Revisa los resultados arriba para verificar que todos los endpoints funcionen correctamente."
echo ""
