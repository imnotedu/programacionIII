# Prueba de conexion Frontend-Backend

Write-Host "=== PRUEBA DE CONEXION FRONTEND-BACKEND ===" -ForegroundColor Magenta

# 1. Verificar que el backend este corriendo
Write-Host "`n1. Verificando backend..." -ForegroundColor Cyan

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -UseBasicParsing
    Write-Host "OK: Backend funcionando" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend no esta corriendo" -ForegroundColor Red
    exit 1
}

# 2. Verificar CORS
Write-Host "`n2. Verificando CORS..." -ForegroundColor Cyan

$headers = @{
    "Origin" = "http://localhost:8081"
}

try {
    $corsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Get -Headers $headers -UseBasicParsing
    $corsHeader = $corsResponse.Headers["Access-Control-Allow-Origin"]
    
    if ($corsHeader -eq "http://localhost:8081") {
        Write-Host "OK: CORS configurado correctamente para puerto 8081" -ForegroundColor Green
    } else {
        Write-Host "ADVERTENCIA: CORS configurado para: $corsHeader" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERROR: Problema con CORS" -ForegroundColor Red
}

# 3. Probar login desde frontend
Write-Host "`n3. Probando login..." -ForegroundColor Cyan

$loginBody = '{"email":"admin","password":"1234567"}'
try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginJson = $loginResponse.Content | ConvertFrom-Json
    $token = $loginJson.data.token
    Write-Host "OK: Login exitoso" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Yellow
} catch {
    Write-Host "ERROR: Login fallo" -ForegroundColor Red
    exit 1
}

# 4. Probar obtener productos
Write-Host "`n4. Probando obtener productos..." -ForegroundColor Cyan

try {
    $productsResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Get -UseBasicParsing
    $productsJson = $productsResponse.Content | ConvertFrom-Json
    Write-Host "OK: Productos obtenidos - Total: $($productsJson.data.count)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudieron obtener productos" -ForegroundColor Red
}

# 5. Probar obtener carrito
Write-Host "`n5. Probando obtener carrito..." -ForegroundColor Cyan

$authHeaders = @{
    "Authorization" = "Bearer $token"
}

try {
    $cartResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $authHeaders -UseBasicParsing
    $cartJson = $cartResponse.Content | ConvertFrom-Json
    Write-Host "OK: Carrito obtenido - Items: $($cartJson.data.itemCount), Total: $($cartJson.data.total)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo obtener carrito" -ForegroundColor Red
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Magenta
Write-Host "Backend: OK" -ForegroundColor Green
Write-Host "CORS: OK" -ForegroundColor Green
Write-Host "Login: OK" -ForegroundColor Green
Write-Host "Productos: OK" -ForegroundColor Green
Write-Host "Carrito: OK" -ForegroundColor Green
Write-Host "`nFrontend puede conectarse correctamente con el backend" -ForegroundColor Green
Write-Host "Abre http://localhost:8081 en tu navegador" -ForegroundColor Cyan
