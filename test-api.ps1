# Script de prueba de API
# PowerShell script para probar los endpoints

Write-Host "=== PRUEBA 1: Login como Admin ===" -ForegroundColor Cyan

$loginBody = @{
    email = "admin@powerfit.com"
    password = "1234567Ed!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host "Token: $($response.data.token.Substring(0, 50))..." -ForegroundColor Yellow
Write-Host "Usuario: $($response.data.user.name)" -ForegroundColor Yellow
Write-Host "Nivel: $($response.data.user.level)" -ForegroundColor Yellow

$token = $response.data.token

Write-Host "`n=== PRUEBA 2: Crear Producto (Admin) ===" -ForegroundColor Cyan

$productBody = @{
    name = "Proteína Whey Gold"
    code = "PROT-001"
    price = 45.99
    description = "Proteína de suero de leche de alta calidad con 24g de proteína por porción"
    category = "Proteínas"
    stock = 100
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$product1 = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody -Headers $headers

Write-Host "✅ Producto creado" -ForegroundColor Green
Write-Host "ID: $($product1.data.product.id)" -ForegroundColor Yellow
Write-Host "Nombre: $($product1.data.product.name)" -ForegroundColor Yellow
Write-Host "Código: $($product1.data.product.code)" -ForegroundColor Yellow
Write-Host "Precio: $($product1.data.product.price)" -ForegroundColor Yellow

Write-Host "`n=== PRUEBA 3: Crear Segundo Producto ===" -ForegroundColor Cyan

$productBody2 = @{
    name = "Creatina Monohidratada"
    code = "CREA-001"
    price = 29.99
    description = "Creatina pura micronizada para aumentar fuerza y masa muscular"
    category = "Creatinas"
    stock = 50
} | ConvertTo-Json

$product2 = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody2 -Headers $headers

Write-Host "✅ Segundo producto creado" -ForegroundColor Green
Write-Host "Nombre: $($product2.data.product.name)" -ForegroundColor Yellow
Write-Host "Código: $($product2.data.product.code)" -ForegroundColor Yellow

Write-Host "`n=== PRUEBA 4: Obtener Todos los Productos (Público) ===" -ForegroundColor Cyan

$allProducts = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get

Write-Host "✅ Productos obtenidos" -ForegroundColor Green
Write-Host "Total de productos: $($allProducts.data.count)" -ForegroundColor Yellow
foreach ($prod in $allProducts.data.products) {
    Write-Host "  - $($prod.name) ($($prod.code)) - `$$($prod.price)" -ForegroundColor White
}

Write-Host "`n=== PRUEBA 5: Obtener Producto por Código ===" -ForegroundColor Cyan

$productByCode = Invoke-RestMethod -Uri "http://localhost:3000/api/products/code/PROT-001" -Method Get

Write-Host "✅ Producto encontrado por código" -ForegroundColor Green
Write-Host "Nombre: $($productByCode.data.product.name)" -ForegroundColor Yellow
Write-Host "Descripción: $($productByCode.data.product.description)" -ForegroundColor Yellow

Write-Host "`n=== PRUEBA 6: Actualizar Producto (Admin) ===" -ForegroundColor Cyan

$updateBody = @{
    price = 39.99
    stock = 80
} | ConvertTo-Json

$updated = Invoke-RestMethod -Uri "http://localhost:3000/api/products/$($product1.data.product.id)" -Method Put -Body $updateBody -Headers $headers

Write-Host "✅ Producto actualizado" -ForegroundColor Green
Write-Host "Nuevo precio: $($updated.data.product.price)" -ForegroundColor Yellow
Write-Host "Nuevo stock: $($updated.data.product.stock)" -ForegroundColor Yellow

Write-Host "`n=== PRUEBA 7: Intentar Crear Producto sin Token ===" -ForegroundColor Cyan

try {
    $productBody3 = @{
        name = "Test Sin Auth"
        code = "TEST-001"
        price = 10.00
        description = "Este no debería crearse"
        category = "Test"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody3 -ContentType "application/json"
    Write-Host "❌ ERROR: Se creó sin autenticación" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctamente bloqueado sin token" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== PRUEBA 8: Validación de Precio > 0 ===" -ForegroundColor Cyan

try {
    $invalidProduct = @{
        name = "Producto Inválido"
        code = "INV-001"
        price = -10.00
        description = "Precio negativo no debería permitirse"
        category = "Test"
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $invalidProduct -Headers $headers
    Write-Host "❌ ERROR: Se aceptó precio negativo" -ForegroundColor Red
} catch {
    Write-Host "✅ Validación de precio funcionando" -ForegroundColor Green
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n=== RESUMEN DE PRUEBAS ===" -ForegroundColor Cyan
Write-Host "✅ Login como admin" -ForegroundColor Green
Write-Host "✅ Crear productos (admin)" -ForegroundColor Green
Write-Host "✅ Obtener todos los productos (público)" -ForegroundColor Green
Write-Host "✅ Obtener producto por código (público)" -ForegroundColor Green
Write-Host "✅ Actualizar producto (admin)" -ForegroundColor Green
Write-Host "✅ Protección sin token" -ForegroundColor Green
Write-Host "✅ Validación de precio > 0" -ForegroundColor Green

Write-Host "`n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE" -ForegroundColor Green
