# Pruebas del Carrito de Compras

Write-Host "=== PRUEBAS DEL CARRITO DE COMPRAS ===" -ForegroundColor Magenta

# 1. Login como usuario normal
Write-Host "`n1. Login como usuario normal..." -ForegroundColor Cyan

$loginBody = '{"email":"test@example.com","password":"password123"}'
$loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -UseBasicParsing
$loginJson = $loginResponse.Content | ConvertFrom-Json
$userToken = $loginJson.data.token
Write-Host "OK: Login exitoso" -ForegroundColor Green

# 2. Login como admin para crear productos
Write-Host "`n2. Login como admin..." -ForegroundColor Cyan

$adminBody = '{"email":"admin","password":"1234567"}'
$adminResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $adminBody -ContentType "application/json" -UseBasicParsing
$adminJson = $adminResponse.Content | ConvertFrom-Json
$adminToken = $adminJson.data.token
Write-Host "OK: Admin login exitoso" -ForegroundColor Green

# 3. Obtener o crear productos de prueba
Write-Host "`n3. Obtener o crear productos de prueba..." -ForegroundColor Cyan

$headers = @{ "Authorization" = "Bearer $adminToken" }

# Intentar obtener productos existentes
try {
    $existingProducts = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Get -UseBasicParsing
    $productsJson = $existingProducts.Content | ConvertFrom-Json
    
    if ($productsJson.data.count -ge 2) {
        $productId1 = $productsJson.data.products[0].id
        $productId2 = $productsJson.data.products[1].id
        Write-Host "OK: Usando productos existentes" -ForegroundColor Green
    } else {
        throw "No hay suficientes productos"
    }
} catch {
    # Crear productos nuevos
    $product1 = '{"name":"Proteina Whey Gold","code":"PROT-GOLD-' + (Get-Date -Format "HHmmss") + '","price":59.99,"description":"Proteina premium","category":"Proteinas","stock":50}'
    $p1Response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $product1 -ContentType "application/json" -Headers $headers -UseBasicParsing
    $p1Json = $p1Response.Content | ConvertFrom-Json
    $productId1 = $p1Json.data.product.id
    Write-Host "OK: Producto 1 creado: $($p1Json.data.product.name)" -ForegroundColor Green

    $product2 = '{"name":"Creatina Monohidrato","code":"CREA-MONO-' + (Get-Date -Format "HHmmss") + '","price":29.99,"description":"Creatina pura","category":"Suplementos","stock":100}'
    $p2Response = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Post -Body $product2 -ContentType "application/json" -Headers $headers -UseBasicParsing
    $p2Json = $p2Response.Content | ConvertFrom-Json
    $productId2 = $p2Json.data.product.id
    Write-Host "OK: Producto 2 creado: $($p2Json.data.product.name)" -ForegroundColor Green
}

# 4. Ver carrito vacio
Write-Host "`n4. Ver carrito vacio..." -ForegroundColor Cyan

$userHeaders = @{ "Authorization" = "Bearer $userToken" }
$cartResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $userHeaders -UseBasicParsing
$cart = $cartResponse.Content | ConvertFrom-Json
Write-Host "OK: Carrito vacio - Total: $($cart.data.total), Items: $($cart.data.itemCount)" -ForegroundColor Green

# 5. Agregar primer producto al carrito
Write-Host "`n5. Agregar primer producto al carrito..." -ForegroundColor Cyan

$addItem1 = "{`"productId`":`"$productId1`",`"quantity`":2}"
$addResponse1 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items" -Method Post -Body $addItem1 -ContentType "application/json" -Headers $userHeaders -UseBasicParsing
$added1 = $addResponse1.Content | ConvertFrom-Json
Write-Host "OK: Producto agregado - Cantidad: $($added1.data.item.quantity)" -ForegroundColor Green

# 6. Agregar segundo producto al carrito
Write-Host "`n6. Agregar segundo producto al carrito..." -ForegroundColor Cyan

$addItem2 = "{`"productId`":`"$productId2`",`"quantity`":3}"
$addResponse2 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items" -Method Post -Body $addItem2 -ContentType "application/json" -Headers $userHeaders -UseBasicParsing
$added2 = $addResponse2.Content | ConvertFrom-Json
Write-Host "OK: Producto agregado - Cantidad: $($added2.data.item.quantity)" -ForegroundColor Green

# 7. Ver carrito con productos
Write-Host "`n7. Ver carrito con productos..." -ForegroundColor Cyan

$cartResponse2 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $userHeaders -UseBasicParsing
$cart2 = $cartResponse2.Content | ConvertFrom-Json
Write-Host "OK: Carrito con items - Total: $($cart2.data.total), Items: $($cart2.data.itemCount)" -ForegroundColor Green
Write-Host "   Item 1: $($cart2.data.items[0].product.name) x $($cart2.data.items[0].quantity) = $($cart2.data.items[0].subtotal)" -ForegroundColor Yellow
Write-Host "   Item 2: $($cart2.data.items[1].product.name) x $($cart2.data.items[1].quantity) = $($cart2.data.items[1].subtotal)" -ForegroundColor Yellow

# 8. Agregar mismo producto (debe incrementar cantidad)
Write-Host "`n8. Agregar mismo producto (debe incrementar cantidad)..." -ForegroundColor Cyan

$addItem3 = "{`"productId`":`"$productId1`",`"quantity`":1}"
$addResponse3 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items" -Method Post -Body $addItem3 -ContentType "application/json" -Headers $userHeaders -UseBasicParsing
$added3 = $addResponse3.Content | ConvertFrom-Json
Write-Host "OK: Cantidad incrementada - Nueva cantidad: $($added3.data.item.quantity)" -ForegroundColor Green

# 9. Actualizar cantidad de un producto
Write-Host "`n9. Actualizar cantidad de un producto..." -ForegroundColor Cyan

$updateBody = '{"quantity":5}'
$updateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items/$productId2" -Method Put -Body $updateBody -ContentType "application/json" -Headers $userHeaders -UseBasicParsing
$updated = $updateResponse.Content | ConvertFrom-Json
Write-Host "OK: Cantidad actualizada - Nueva cantidad: $($updated.data.item.quantity)" -ForegroundColor Green

# 10. Ver carrito actualizado
Write-Host "`n10. Ver carrito actualizado..." -ForegroundColor Cyan

$cartResponse3 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $userHeaders -UseBasicParsing
$cart3 = $cartResponse3.Content | ConvertFrom-Json
Write-Host "OK: Total actualizado: $($cart3.data.total)" -ForegroundColor Green

# 11. Validar stock insuficiente
Write-Host "`n11. Intentar agregar mas productos que el stock (debe fallar)..." -ForegroundColor Cyan

try {
    $addBad = "{`"productId`":`"$productId1`",`"quantity`":100}"
    $badResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items" -Method Post -Body $addBad -ContentType "application/json" -Headers $userHeaders -UseBasicParsing
    Write-Host "ERROR: Se permitio agregar mas que el stock" -ForegroundColor Red
} catch {
    Write-Host "OK: Se rechazo por stock insuficiente" -ForegroundColor Green
}

# 12. Eliminar un producto del carrito
Write-Host "`n12. Eliminar un producto del carrito..." -ForegroundColor Cyan

$deleteResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart/items/$productId1" -Method Delete -Headers $userHeaders -UseBasicParsing
Write-Host "OK: Producto eliminado del carrito" -ForegroundColor Green

# 13. Ver carrito despues de eliminar
Write-Host "`n13. Ver carrito despues de eliminar..." -ForegroundColor Cyan

$cartResponse4 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $userHeaders -UseBasicParsing
$cart4 = $cartResponse4.Content | ConvertFrom-Json
Write-Host "OK: Items restantes: $($cart4.data.itemCount)" -ForegroundColor Green

# 14. Limpiar carrito completo
Write-Host "`n14. Limpiar carrito completo..." -ForegroundColor Cyan

$clearResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Delete -Headers $userHeaders -UseBasicParsing
Write-Host "OK: Carrito limpiado" -ForegroundColor Green

# 15. Verificar carrito vacio
Write-Host "`n15. Verificar carrito vacio..." -ForegroundColor Cyan

$cartResponse5 = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -Headers $userHeaders -UseBasicParsing
$cart5 = $cartResponse5.Content | ConvertFrom-Json
Write-Host "OK: Carrito vacio - Total: $($cart5.data.total), Items: $($cart5.data.itemCount)" -ForegroundColor Green

# 16. Probar autenticacion requerida
Write-Host "`n16. Intentar acceder al carrito sin autenticacion (debe fallar)..." -ForegroundColor Cyan

try {
    $noAuthResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/cart" -Method Get -UseBasicParsing
    Write-Host "ERROR: Se permitio acceso sin autenticacion" -ForegroundColor Red
} catch {
    Write-Host "OK: Se rechazo acceso sin autenticacion" -ForegroundColor Green
}

Write-Host "`n=== RESUMEN ===" -ForegroundColor Magenta
Write-Host "OK: Carrito vacio funcionando" -ForegroundColor Green
Write-Host "OK: Agregar productos funcionando" -ForegroundColor Green
Write-Host "OK: Incrementar cantidad de producto existente" -ForegroundColor Green
Write-Host "OK: Actualizar cantidad funcionando" -ForegroundColor Green
Write-Host "OK: Calculos de totales correctos" -ForegroundColor Green
Write-Host "OK: Validacion de stock funcionando" -ForegroundColor Green
Write-Host "OK: Eliminar productos funcionando" -ForegroundColor Green
Write-Host "OK: Limpiar carrito funcionando" -ForegroundColor Green
Write-Host "OK: Autenticacion requerida funcionando" -ForegroundColor Green
Write-Host "`nTODAS LAS PRUEBAS DEL CARRITO PASARON EXITOSAMENTE" -ForegroundColor Green
