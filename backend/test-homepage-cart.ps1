# Test script for homepage cart functionality
Write-Host "Testing Add to Cart from Homepage" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Verify homepage loads
Write-Host "Test 1: Checking homepage..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -UseBasicParsing -SessionVariable session
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Homepage loads (Status: 200)" -ForegroundColor Green
        
        if ($response.Content -match "cart\.js") {
            Write-Host "SUCCESS: cart.js script is included" -ForegroundColor Green
        } else {
            Write-Host "ERROR: cart.js script NOT included" -ForegroundColor Red
        }
        
        if ($response.Content -match "add-to-cart-btn") {
            Write-Host "SUCCESS: Add to cart buttons found" -ForegroundColor Green
        } else {
            Write-Host "ERROR: Add to cart buttons NOT found" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "ERROR loading homepage: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Add product to cart
Write-Host "Test 2: Adding product to cart..." -ForegroundColor Yellow
try {
    $body = @{
        productId = "1"
        quantity = 1
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$baseUrl/api/cart/add" -Method POST -Body $body -Headers $headers -WebSession $session
    
    if ($response.success) {
        Write-Host "SUCCESS: Product added" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor Gray
        Write-Host "   Cart items: $($response.cartCount)" -ForegroundColor Gray
        Write-Host "   Total: `$$($response.total)" -ForegroundColor Gray
    } else {
        Write-Host "ERROR: Failed to add product" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Verify cart page
Write-Host "Test 3: Checking cart page..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/carrito" -UseBasicParsing -WebSession $session
    if ($response.StatusCode -eq 200) {
        Write-Host "SUCCESS: Cart page loads" -ForegroundColor Green
        
        if ($response.Content -match "cart-item") {
            Write-Host "SUCCESS: Product visible in cart" -ForegroundColor Green
        } else {
            Write-Host "WARNING: No products found in cart" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Add another product
Write-Host "Test 4: Adding second product..." -ForegroundColor Yellow
try {
    $body = @{
        productId = "2"
        quantity = 2
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
    }

    $response = Invoke-RestMethod -Uri "$baseUrl/api/cart/add" -Method POST -Body $body -Headers $headers -WebSession $session
    
    if ($response.success) {
        Write-Host "SUCCESS: Second product added" -ForegroundColor Green
        Write-Host "   Cart items: $($response.cartCount)" -ForegroundColor Gray
        Write-Host "   Total: `$$($response.total)" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

# Test 5: Clear cart
Write-Host "Test 5: Clearing cart..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/cart/clear" -Method DELETE -WebSession $session
    
    if ($response.success) {
        Write-Host "SUCCESS: Cart cleared" -ForegroundColor Green
        Write-Host "   Cart items: $($response.cartCount)" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Manual Testing Instructions:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3000" -ForegroundColor White
Write-Host "2. See products in sale and popular sections" -ForegroundColor White
Write-Host "3. Click Add to cart button on any product" -ForegroundColor White
Write-Host "4. See success notification" -ForegroundColor White
Write-Host "5. Cart counter in header updates" -ForegroundColor White
Write-Host "6. Go to /carrito to see products" -ForegroundColor White
