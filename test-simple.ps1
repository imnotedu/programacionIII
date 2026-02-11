# Prueba simple del API

Write-Host "1. Login como admin..." -ForegroundColor Cyan

$body = '{"email":"admin","password":"1234567"}'
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing

$json = $response.Content | ConvertFrom-Json
Write-Host "✅ Login exitoso" -ForegroundColor Green
Write-Host "Token obtenido" -ForegroundColor Yellow

$token = $json.data.token

Write-Host "`n2. Crear producto..." -ForegroundColor Cyan

$productBody = '{"name":"Proteína Whey","code":"PROT-001","price":45.99,"description":"Proteína de alta calidad","category":"Proteínas","stock":100}'

$headers = @{
    "Authorization" = "Bearer $token"
}

$productResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $productBody -ContentType "application/json" -Headers $headers -UseBasicParsing

$product = $productResponse.Content | ConvertFrom-Json
Write-Host "✅ Producto creado: $($product.data.product.name)" -ForegroundColor Green

Write-Host "`n3. Obtener todos los productos..." -ForegroundColor Cyan

$allResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Get -UseBasicParsing
$all = $allResponse.Content | ConvertFrom-Json

Write-Host "✅ Total de productos: $($all.data.count)" -ForegroundColor Green

Write-Host "`n4. Obtener producto por código..." -ForegroundColor Cyan

$byCodeResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products/code/PROT-001" -Method Get -UseBasicParsing
$byCode = $byCodeResponse.Content | ConvertFrom-Json

Write-Host "✅ Producto encontrado: $($byCode.data.product.name)" -ForegroundColor Green

Write-Host "`n🎉 TODAS LAS PRUEBAS EXITOSAS" -ForegroundColor Green
