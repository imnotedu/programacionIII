# Script de prueba para creación de productos
# Verifica que el endpoint de productos funcione correctamente

Write-Host "=== Test de Creación de Producto ===" -ForegroundColor Cyan
Write-Host ""

# 1. Login como admin
Write-Host "1. Login como admin..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"email":"admin@powerfit.com","password":"1234567Ed!"}'

$token = $loginResponse.data.token
Write-Host "✓ Login exitoso" -ForegroundColor Green
Write-Host ""

# 2. Crear producto SIN imagen
Write-Host "2. Crear producto SIN imagen..." -ForegroundColor Yellow
try {
    $productData = @{
        name = "Producto Test Sin Imagen"
        code = "TEST001"
        price = 29.99
        description = "Este es un producto de prueba sin imagen para verificar la validación"
        category = "Proteínas"
        stock = 10
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $token" } `
        -Body $productData

    Write-Host "✓ Producto creado exitosamente (sin imagen)" -ForegroundColor Green
    Write-Host "  ID: $($createResponse.data.product.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Error al crear producto sin imagen:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

# 3. Crear producto CON imagen
Write-Host "3. Crear producto CON imagen..." -ForegroundColor Yellow
try {
    $productData = @{
        name = "Producto Test Con Imagen"
        code = "TEST002"
        price = 39.99
        description = "Este es un producto de prueba con imagen para verificar la validación"
        category = "Pre-entreno"
        imageUrl = "https://via.placeholder.com/300"
        stock = 5
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/products" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $token" } `
        -Body $productData

    Write-Host "✓ Producto creado exitosamente (con imagen)" -ForegroundColor Green
    Write-Host "  ID: $($createResponse.data.product.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Error al crear producto con imagen:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
}

Write-Host "=== Test Completado ===" -ForegroundColor Cyan
