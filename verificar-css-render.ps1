# Script de verificación de CSS en Render (PowerShell)
# Ejecuta este script localmente para verificar que todo esté correcto antes de desplegar

Write-Host "🔍 Verificando configuración de CSS..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en la carpeta correcta
Write-Host "📁 Directorio actual:" -ForegroundColor Yellow
Get-Location
Write-Host ""

# 2. Verificar estructura de carpetas
Write-Host "📂 Estructura de carpetas backend:" -ForegroundColor Yellow
if (Test-Path "backend") {
    Get-ChildItem "backend" -Directory | Select-Object Name
} else {
    Write-Host "❌ Carpeta backend no encontrada" -ForegroundColor Red
}
Write-Host ""

# 3. Verificar que existe la carpeta public
Write-Host "📂 Contenido de public:" -ForegroundColor Yellow
if (Test-Path "backend\public") {
    Get-ChildItem "backend\public" -Directory | Select-Object Name
    Write-Host "✅ Carpeta public encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta public no encontrada" -ForegroundColor Red
}
Write-Host ""

# 4. Verificar que existe la carpeta css
Write-Host "📂 Contenido de public/css:" -ForegroundColor Yellow
if (Test-Path "backend\public\css") {
    Get-ChildItem "backend\public\css" | Select-Object Name, Length
    Write-Host "✅ Carpeta css encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta css no encontrada" -ForegroundColor Red
}
Write-Host ""

# 5. Verificar el tamaño del archivo CSS
Write-Host "📄 Verificando styles.css:" -ForegroundColor Yellow
if (Test-Path "backend\public\css\styles.css") {
    $cssFile = Get-Item "backend\public\css\styles.css"
    $size = $cssFile.Length
    Write-Host "✅ Archivo styles.css encontrado!" -ForegroundColor Green
    Write-Host "   Tamaño: $size bytes" -ForegroundColor White
    
    if ($size -lt 10000) {
        Write-Host "   ⚠️  ADVERTENCIA: El archivo es muy pequeño (menos de 10KB)" -ForegroundColor Yellow
        Write-Host "   Esto puede indicar que Tailwind no generó todas las clases" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Tamaño correcto" -ForegroundColor Green
    }
} else {
    Write-Host "❌ ERROR: Archivo styles.css NO encontrado!" -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build:css" -ForegroundColor Yellow
}
Write-Host ""

# 6. Verificar que existe dist/server.js
Write-Host "📂 Verificando servidor compilado:" -ForegroundColor Yellow
if (Test-Path "backend\dist\server.js") {
    Write-Host "✅ server.js encontrado en backend\dist\" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: server.js NO encontrado!" -ForegroundColor Red
    Write-Host "   Ejecuta: npm run build" -ForegroundColor Yellow
}
Write-Host ""

# 7. Verificar package.json scripts
Write-Host "📝 Scripts de build en package.json:" -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    $packageJson = Get-Content "backend\package.json" -Raw | ConvertFrom-Json
    Write-Host "   build: $($packageJson.scripts.build)" -ForegroundColor White
    Write-Host "   build:css: $($packageJson.scripts.'build:css')" -ForegroundColor White
} else {
    Write-Host "❌ package.json no encontrado" -ForegroundColor Red
}
Write-Host ""

# 8. Verificar tailwind.config.js
Write-Host "📝 Verificando tailwind.config.js:" -ForegroundColor Yellow
if (Test-Path "backend\tailwind.config.js") {
    Write-Host "✅ tailwind.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: tailwind.config.js NO encontrado!" -ForegroundColor Red
}
Write-Host ""

# 9. Verificar views
Write-Host "📂 Verificando carpeta views:" -ForegroundColor Yellow
if (Test-Path "backend\views") {
    $ejsFiles = (Get-ChildItem "backend\views" -Recurse -Filter "*.ejs").Count
    Write-Host "✅ Carpeta views encontrada" -ForegroundColor Green
    Write-Host "   Archivos EJS: $ejsFiles" -ForegroundColor White
} else {
    Write-Host "❌ ERROR: Carpeta views NO encontrada!" -ForegroundColor Red
}
Write-Host ""

# 10. Verificar src/index.css
Write-Host "📝 Verificando src/index.css:" -ForegroundColor Yellow
if (Test-Path "backend\src\index.css") {
    Write-Host "✅ index.css encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: index.css NO encontrado!" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎯 Resumen:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Verificar si todo está OK
$errors = 0

if (-not (Test-Path "backend\public\css\styles.css")) {
    Write-Host "❌ CSS no generado - Ejecuta: npm run build:css" -ForegroundColor Red
    $errors++
}

if (-not (Test-Path "backend\dist\server.js")) {
    Write-Host "❌ Servidor no compilado - Ejecuta: npm run build" -ForegroundColor Red
    $errors++
}

if (-not (Test-Path "backend\tailwind.config.js")) {
    Write-Host "❌ tailwind.config.js faltante" -ForegroundColor Red
    $errors++
}

if (-not (Test-Path "backend\src\index.css")) {
    Write-Host "❌ src/index.css faltante" -ForegroundColor Red
    $errors++
}

if ($errors -eq 0) {
    Write-Host "✅ Todo está correcto!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes desplegar a Render con confianza." -ForegroundColor Green
    Write-Host ""
    Write-Host "Comandos para Render:" -ForegroundColor Yellow
    Write-Host "  Build Command: cd backend && npm install && npm run build" -ForegroundColor White
    Write-Host "  Start Command: cd backend && npm start" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⚠️  Se encontraron $errors problema(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para regenerar el CSS, ejecuta:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run build:css" -ForegroundColor White
    Write-Host ""
    Write-Host "Para recompilar todo, ejecuta:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  npm run build" -ForegroundColor White
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Si todo está OK localmente pero falla en Render:" -ForegroundColor Cyan
Write-Host "   1. Verifica los logs de build en Render" -ForegroundColor White
Write-Host "   2. Usa Render Shell para ejecutar: bash verificar-css-render.sh" -ForegroundColor White
Write-Host "   3. Visita: https://tu-app.onrender.com/css/styles.css" -ForegroundColor White
