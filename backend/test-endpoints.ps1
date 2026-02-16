# Script de Pruebas de Endpoints - PowerFit
# Este script prueba todos los endpoints requeridos por el PDF de evaluación

Write-Host "🧪 Iniciando pruebas de endpoints de PowerFit..." -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:3000"

# Variables para tokens
$ADMIN_TOKEN = ""
$USER_TOKEN = ""
$PRODUCT_ID = ""

# Función para imprimir resultados
function Print-Result {
    param (
        [bool]$Success,
        [string]$Message
    )
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 EVALUACIÓN 2: LOGIN BÁSICO" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# Test 1: Registro de usuario
Write-Host "Test 1: Registro de nuevo usuario"
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$body = @{
    name = "Usuario de Prueba"
    email = "test-$timestamp@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        $USER_TOKEN = $response.data.token
        Print-Result $true "Registro exitoso - Token obtenido"
    } else {
        Print-Result $false "Registro falló"
    }
} catch {
    Print-Result $false "Registro falló - Error: $_"
}
Write-Host ""

# Test 2: Login con superadmin
Write-Host "Test 2: Login con superadmin"
$body = @{
    email = "admin@powerfit.com"
    password = "1234567"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    if ($response.success) {
        $ADMIN_TOKEN = $response.data.token
        Print-Result $true "Login de admin exitoso - Token obtenido"
    } else {
        Print-Result $false "Login de admin falló"
    }
} catch {
    Print-Result $false "Login de admin falló - Error: $_"
}
Write-Host ""

# Test 3: Obtener perfil de usuario
Write-Host "Test 3: Obtener perfil de usuario autenticado"
try {
    $headers = @{
        Authorization = "Bearer $USER_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/me" -Method Get -Headers $headers
    if ($response.success) {
        Print-Result $true "Perfil obtenido correctamente"
    } else {
        Print-Result $false "Obtener perfil falló"
    }
} catch {
    Print-Result $false "Obtener perfil falló - Error: $_"
}
Write-Host ""

# Test 4: Login con credenciales inválidas
Write-Host "Test 4: Login con credenciales inválidas (debe fallar)"
$body = @{
    email = "noexiste@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
    Print-Result $false "Debería rechazar credenciales inválidas"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Print-Result $true "Rechazo de credenciales inválidas correcto"
    } else {
        Print-Result $false "Error inesperado"
    }
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📦 EVALUACIÓN 3: PRODUCTOS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# Test 5: Ver todos los productos (público)
Write-Host "Test 5: Ver todos los productos (sin autenticación)"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products" -Method Get
    if ($response.success -and $response.data.products.Count -gt 0) {
        $PRODUCT_ID = $response.data.products[0].id
        Print-Result $true "Listado de productos exitoso"
    } else {
        Print-Result $false "Listado de productos falló"
    }
} catch {
    Print-Result $false "Listado de productos falló - Error: $_"
}
Write-Host ""

# Test 6: Ver producto por código (público)
Write-Host "Test 6: Ver producto por código (sin autenticación)"
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products/code/ON-WH-001" -Method Get
    if ($response.success) {
        Print-Result $true "Obtener producto por código exitoso"
    } else {
        Print-Result $false "Obtener producto por código falló"
    }
} catch {
    Print-Result $false "Obtener producto por código falló - Error: $_"
}
Write-Host ""

# Test 7: Ver producto por ID (público)
Write-Host "Test 7: Ver producto por ID (sin autenticación)"
if ($PRODUCT_ID) {
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/products/$PRODUCT_ID" -Method Get
        if ($response.success) {
            Print-Result $true "Obtener producto por ID exitoso"
        } else {
            Print-Result $false "Obtener producto por ID falló"
        }
    } catch {
        Print-Result $false "Obtener producto por ID falló - Error: $_"
    }
} else {
    Print-Result $false "No se pudo obtener ID de producto"
}
Write-Host ""

# Test 8: Crear producto como admin
Write-Host "Test 8: Crear producto como admin"
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$body = @{
    name = "Producto de Prueba"
    code = "TEST-$timestamp"
    price = 29.99
    description = "Producto creado en prueba automatizada"
    category = "Proteínas"
    stock = 10
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $ADMIN_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products" -Method Post -Body $body -ContentType "application/json" -Headers $headers
    if ($response.success) {
        Print-Result $true "Creación de producto como admin exitosa"
    } else {
        Print-Result $false "Creación de producto como admin falló"
    }
} catch {
    Print-Result $false "Creación de producto como admin falló - Error: $_"
}
Write-Host ""

# Test 9: Intentar crear producto como usuario normal (debe fallar)
Write-Host "Test 9: Intentar crear producto como usuario normal (debe fallar)"
$body = @{
    name = "Producto No Autorizado"
    code = "NOAUTH-001"
    price = 29.99
    description = "Este producto no debería crearse"
    category = "Proteínas"
    stock = 10
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $USER_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products" -Method Post -Body $body -ContentType "application/json" -Headers $headers -ErrorAction Stop
    Print-Result $false "Debería rechazar creación por usuario normal"
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Print-Result $true "Rechazo de creación por usuario normal correcto"
    } else {
        Print-Result $false "Error inesperado"
    }
}
Write-Host ""

# Test 10: Validación de precio (debe fallar con precio 0)
Write-Host "Test 10: Validación de precio > 0 (debe fallar)"
$body = @{
    name = "Producto Precio Inválido"
    code = "INVALID-001"
    price = 0
    description = "Precio inválido"
    category = "Proteínas"
    stock = 10
} | ConvertTo-Json

try {
    $headers = @{
        Authorization = "Bearer $ADMIN_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/products" -Method Post -Body $body -ContentType "application/json" -Headers $headers -ErrorAction Stop
    Print-Result $false "Debería rechazar precio <= 0"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Print-Result $true "Validación de precio correcto"
    } else {
        Print-Result $false "Error inesperado"
    }
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "🛒 EVALUACIÓN 4: CARRITO SIMPLE" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""

# Test 11: Ver carrito vacío
Write-Host "Test 11: Ver carrito vacío"
try {
    $headers = @{
        Authorization = "Bearer $USER_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart" -Method Get -Headers $headers
    if ($response.success) {
        Print-Result $true "Obtener carrito exitoso"
    } else {
        Print-Result $false "Obtener carrito falló"
    }
} catch {
    Print-Result $false "Obtener carrito falló - Error: $_"
}
Write-Host ""

# Test 12: Agregar producto al carrito
Write-Host "Test 12: Agregar producto al carrito"
if ($PRODUCT_ID) {
    $body = @{
        productId = $PRODUCT_ID
        quantity = 2
    } | ConvertTo-Json
    
    try {
        $headers = @{
            Authorization = "Bearer $USER_TOKEN"
        }
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart/items" -Method Post -Body $body -ContentType "application/json" -Headers $headers
        if ($response.success) {
            Print-Result $true "Agregar producto al carrito exitoso"
        } else {
            Print-Result $false "Agregar producto al carrito falló"
        }
    } catch {
        Print-Result $false "Agregar producto al carrito falló - Error: $_"
    }
} else {
    Print-Result $false "No se pudo agregar producto (ID no disponible)"
}
Write-Host ""

# Test 13: Ver carrito con productos y total calculado
Write-Host "Test 13: Ver carrito con productos y total calculado"
try {
    $headers = @{
        Authorization = "Bearer $USER_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart" -Method Get -Headers $headers
    if ($response.success -and $response.data.total) {
        Print-Result $true "Carrito con total calculado correcto"
    } else {
        Print-Result $false "Total del carrito no calculado"
    }
} catch {
    Print-Result $false "Ver carrito falló - Error: $_"
}
Write-Host ""

# Test 14: Actualizar cantidad de producto en carrito
Write-Host "Test 14: Actualizar cantidad de producto en carrito"
if ($PRODUCT_ID) {
    $body = @{
        quantity = 5
    } | ConvertTo-Json
    
    try {
        $headers = @{
            Authorization = "Bearer $USER_TOKEN"
        }
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart/items/$PRODUCT_ID" -Method Put -Body $body -ContentType "application/json" -Headers $headers
        if ($response.success) {
            Print-Result $true "Actualizar cantidad exitoso"
        } else {
            Print-Result $false "Actualizar cantidad falló"
        }
    } catch {
        Print-Result $false "Actualizar cantidad falló - Error: $_"
    }
} else {
    Print-Result $false "No se pudo actualizar cantidad (ID no disponible)"
}
Write-Host ""

# Test 15: Eliminar producto del carrito
Write-Host "Test 15: Eliminar producto del carrito"
if ($PRODUCT_ID) {
    try {
        $headers = @{
            Authorization = "Bearer $USER_TOKEN"
        }
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart/items/$PRODUCT_ID" -Method Delete -Headers $headers
        if ($response.success) {
            Print-Result $true "Eliminar producto del carrito exitoso"
        } else {
            Print-Result $false "Eliminar producto del carrito falló"
        }
    } catch {
        Print-Result $false "Eliminar producto del carrito falló - Error: $_"
    }
} else {
    Print-Result $false "No se pudo eliminar producto (ID no disponible)"
}
Write-Host ""

# Test 16: Vaciar carrito completo
Write-Host "Test 16: Vaciar carrito completo"
try {
    $headers = @{
        Authorization = "Bearer $USER_TOKEN"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/cart" -Method Delete -Headers $headers
    if ($response.success) {
        Print-Result $true "Vaciar carrito exitoso"
    } else {
        Print-Result $false "Vaciar carrito falló"
    }
} catch {
    Print-Result $false "Vaciar carrito falló - Error: $_"
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "✅ PRUEBAS COMPLETADAS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "Revisa los resultados arriba para verificar que todos los endpoints funcionen correctamente." -ForegroundColor Cyan
Write-Host ""
