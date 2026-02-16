# Script de Prueba: Edición de Productos
# PowerShell script para probar la funcionalidad de edición

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  PRUEBA: Edición de Productos" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Función para hacer login y obtener cookie
function Get-SessionCookie {
    Write-Host "1. Iniciando sesión como admin..." -ForegroundColor Yellow
    
    $loginData = @{
        email = "admin@powerfit.com"
        password = "1234567"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
            -Method POST `
            -Body $loginData `
            -ContentType "application/json" `
            -SessionVariable session
        
        Write-Host "   ✓ Login exitoso" -ForegroundColor Green
        return $session
    } catch {
        Write-Host "   ✗ Error en login: $_" -ForegroundColor Red
        return $null
    }
}

# Función para obtener lista de productos
function Get-Products {
    param($session)
    
    Write-Host ""
    Write-Host "2. Obteniendo lista de productos..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/products" `
            -Method GET `
            -WebSession $session
        
        $count = $response.data.products.Count
        Write-Host "   ✓ Productos encontrados: $count" -ForegroundColor Green
        
        if ($count -gt 0) {
            $product = $response.data.products[0]
            Write-Host "   → Producto de prueba:" -ForegroundColor Cyan
            Write-Host "     ID: $($product.id)" -ForegroundColor White
            Write-Host "     Nombre: $($product.name)" -ForegroundColor White
            Write-Host "     Código: $($product.code)" -ForegroundColor White
            Write-Host "     Precio: `$$($product.price)" -ForegroundColor White
            Write-Host "     Stock: $($product.stock)" -ForegroundColor White
            return $product
        }
        
        return $null
    } catch {
        Write-Host "   ✗ Error obteniendo productos: $_" -ForegroundColor Red
        return $null
    }
}

# Función para editar producto
function Edit-Product {
    param($session, $product)
    
    Write-Host ""
    Write-Host "3. Editando producto..." -ForegroundColor Yellow
    
    # Nuevos valores
    $newName = "$($product.name) (Editado)"
    $newPrice = [math]::Round($product.price + 5.00, 2)
    $newStock = $product.stock + 10
    
    $editData = @{
        name = $newName
        description = "$($product.description) - Actualizado"
        price = $newPrice
        stock = $newStock
        category = $product.category
    } | ConvertTo-Json
    
    Write-Host "   → Cambios a aplicar:" -ForegroundColor Cyan
    Write-Host "     Nombre: $($product.name) → $newName" -ForegroundColor White
    Write-Host "     Precio: `$$($product.price) → `$$newPrice" -ForegroundColor White
    Write-Host "     Stock: $($product.stock) → $newStock" -ForegroundColor White
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/products/$($product.id)" `
            -Method PUT `
            -Body $editData `
            -ContentType "application/json" `
            -WebSession $session
        
        Write-Host "   ✓ Producto editado exitosamente" -ForegroundColor Green
        return $response.data.product
    } catch {
        Write-Host "   ✗ Error editando producto: $_" -ForegroundColor Red
        return $null
    }
}

# Función para verificar cambios
function Verify-Changes {
    param($session, $productId, $expectedName, $expectedPrice, $expectedStock)
    
    Write-Host ""
    Write-Host "4. Verificando cambios..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/products/$productId" `
            -Method GET `
            -WebSession $session
        
        $product = $response.data.product
        
        $nameMatch = $product.name -eq $expectedName
        $priceMatch = $product.price -eq $expectedPrice
        $stockMatch = $product.stock -eq $expectedStock
        
        Write-Host "   → Verificación:" -ForegroundColor Cyan
        Write-Host "     Nombre: $(if($nameMatch){'✓'}else{'✗'}) $($product.name)" -ForegroundColor $(if($nameMatch){'Green'}else{'Red'})
        Write-Host "     Precio: $(if($priceMatch){'✓'}else{'✗'}) `$$($product.price)" -ForegroundColor $(if($priceMatch){'Green'}else{'Red'})
        Write-Host "     Stock: $(if($stockMatch){'✓'}else{'✗'}) $($product.stock)" -ForegroundColor $(if($stockMatch){'Green'}else{'Red'})
        
        if ($nameMatch -and $priceMatch -and $stockMatch) {
            Write-Host ""
            Write-Host "   ✓ TODOS LOS CAMBIOS VERIFICADOS CORRECTAMENTE" -ForegroundColor Green
            return $true
        } else {
            Write-Host ""
            Write-Host "   ✗ ALGUNOS CAMBIOS NO SE APLICARON" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ✗ Error verificando cambios: $_" -ForegroundColor Red
        return $false
    }
}

# Ejecutar pruebas
Write-Host "Asegúrate de que el servidor esté corriendo en $baseUrl" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

$session = Get-SessionCookie

if ($session) {
    $product = Get-Products -session $session
    
    if ($product) {
        $editedProduct = Edit-Product -session $session -product $product
        
        if ($editedProduct) {
            $verified = Verify-Changes -session $session `
                -productId $editedProduct.id `
                -expectedName $editedProduct.name `
                -expectedPrice $editedProduct.price `
                -expectedStock $editedProduct.stock
            
            Write-Host ""
            Write-Host "==================================" -ForegroundColor Cyan
            if ($verified) {
                Write-Host "  PRUEBA COMPLETADA: EXITOSA ✓" -ForegroundColor Green
            } else {
                Write-Host "  PRUEBA COMPLETADA: FALLIDA ✗" -ForegroundColor Red
            }
            Write-Host "==================================" -ForegroundColor Cyan
        }
    } else {
        Write-Host ""
        Write-Host "No hay productos para probar. Crea al menos un producto primero." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "No se pudo iniciar sesión. Verifica las credenciales." -ForegroundColor Red
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
