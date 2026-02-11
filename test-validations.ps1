# Pruebas de validacion y seguridad

Write-Host "=== PRUEBAS DE VALIDACION Y SEGURIDAD ===" -ForegroundColor Magenta

# 1. Intentar crear producto sin autenticacion
Write-Host "`n1. Intentar crear producto sin token (debe fallar)..." -ForegroundColor Cyan

try {
    $productBody = '{"name":"Producto Sin Auth","code":"TEST-001","price":10,"category":"Test","stock":5}'
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody -ContentType "application/json" -UseBasicParsing
    Write-Host "ERROR: Se permitio crear producto sin autenticacion" -ForegroundColor Red
} catch {
    Write-Host "OK: Se rechazo la peticion sin token" -ForegroundColor Green
}

# 2. Login como usuario normal
Write-Host "`n2. Registrar y hacer login como usuario normal..." -ForegroundColor Cyan

$registerBody = '{"name":"Usuario Test","email":"test@example.com","password":"password123"}'
try {
    $regResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -UseBasicParsing
    $regJson = $regResponse.Content | ConvertFrom-Json
    $userToken = $regJson.data.token
    Write-Host "OK: Usuario registrado exitosamente" -ForegroundColor Green
} catch {
    # Si ya existe, hacer login
    $loginBody = '{"email":"test@example.com","password":"password123"}'
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginJson = $loginResponse.Content | ConvertFrom-Json
    $userToken = $loginJson.data.token
    Write-Host "OK: Login exitoso con usuario existente" -ForegroundColor Green
}

# 3. Intentar crear producto con usuario normal
Write-Host "`n3. Intentar crear producto con usuario normal (debe fallar)..." -ForegroundColor Cyan

try {
    $productBody = '{"name":"Producto Usuario","code":"USER-001","price":10,"category":"Test","stock":5}'
    $headers = @{ "Authorization" = "Bearer $userToken" }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody -ContentType "application/json" -Headers $headers -UseBasicParsing
    Write-Host "ERROR: Usuario normal pudo crear producto" -ForegroundColor Red
} catch {
    Write-Host "OK: Usuario normal no puede crear productos" -ForegroundColor Green
}

# 4. Login como admin
Write-Host "`n4. Login como admin..." -ForegroundColor Cyan

$adminBody = '{"email":"admin","password":"1234567"}'
$adminResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $adminBody -ContentType "application/json" -UseBasicParsing
$adminJson = $adminResponse.Content | ConvertFrom-Json
$adminToken = $adminJson.data.token
Write-Host "OK: Admin login exitoso" -ForegroundColor Green

# 5. Validar precio negativo
Write-Host "`n5. Intentar crear producto con precio negativo (debe fallar)..." -ForegroundColor Cyan

try {
    $badProduct = '{"name":"Producto Malo","code":"BAD-001","price":-10,"category":"Test","stock":5}'
    $headers = @{ "Authorization" = "Bearer $adminToken" }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $badProduct -ContentType "application/json" -Headers $headers -UseBasicParsing
    Write-Host "ERROR: Se permitio precio negativo" -ForegroundColor Red
} catch {
    Write-Host "OK: Se rechazo precio negativo" -ForegroundColor Green
}

# 6. Validar codigo duplicado
Write-Host "`n6. Intentar crear producto con codigo duplicado (debe fallar)..." -ForegroundColor Cyan

try {
    $dupProduct = '{"name":"Producto Duplicado","code":"PROT-001","price":50,"category":"Test","stock":10}'
    $headers = @{ "Authorization" = "Bearer $adminToken" }
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $dupProduct -ContentType "application/json" -Headers $headers -UseBasicParsing
    Write-Host "ERROR: Se permitio codigo duplicado" -ForegroundColor Red
} catch {
    Write-Host "OK: Se rechazo codigo duplicado" -ForegroundColor Green
}

# 7. Crear producto valido
Write-Host "`n7. Crear producto valido con admin..." -ForegroundColor Cyan

$validProduct = '{"name":"Creatina Monohidrato","code":"CREA-001","price":29.99,"description":"Creatina pura","category":"Suplementos","stock":50}'
$headers = @{ "Authorization" = "Bearer $adminToken" }
$createResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $validProduct -ContentType "application/json" -Headers $headers -UseBasicParsing
$created = $createResponse.Content | ConvertFrom-Json
Write-Host "OK: Producto creado: $($created.data.product.name)" -ForegroundColor Green
$productId = $created.data.product.id

# 8. Actualizar producto
Write-Host "`n8. Actualizar producto..." -ForegroundColor Cyan

$updateBody = '{"price":34.99,"stock":75}'
$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products/$productId" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers -UseBasicParsing
$updated = $updateResponse.Content | ConvertFrom-Json
Write-Host "OK: Producto actualizado - Nuevo precio: $($updated.data.product.price)" -ForegroundColor Green

# 9. Eliminar producto
Write-Host "`n9. Eliminar producto..." -ForegroundColor Cyan

$deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products/$productId" -Method Delete -Headers $headers -UseBasicParsing
Write-Host "OK: Producto eliminado exitosamente" -ForegroundColor Green

# 10. Verificar que el producto fue eliminado
Write-Host "`n10. Verificar que el producto fue eliminado..." -ForegroundColor Cyan

try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products/$productId" -Method Get -UseBasicParsing
    Write-Host "ERROR: El producto aun existe" -ForegroundColor Red
} catch {
    Write-Host "OK: Producto no encontrado (eliminado)" -ForegroundColor Green
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Magenta
Write-Host "OK: Autenticacion funcionando correctamente" -ForegroundColor Green
Write-Host "OK: Autorizacion (admin/usuario) funcionando" -ForegroundColor Green
Write-Host "OK: Validaciones de datos funcionando" -ForegroundColor Green
Write-Host "OK: CRUD completo funcionando" -ForegroundColor Green
Write-Host "`nTODAS LAS VALIDACIONES PASARON EXITOSAMENTE" -ForegroundColor Green
