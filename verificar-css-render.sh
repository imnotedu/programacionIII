#!/bin/bash

# Script de verificación de CSS en Render
# Ejecuta este script en Render Shell para diagnosticar problemas de CSS

echo "🔍 Verificando configuración de CSS en Render..."
echo ""

# 1. Verificar que estamos en la carpeta correcta
echo "📁 Directorio actual:"
pwd
echo ""

# 2. Verificar estructura de carpetas
echo "📂 Estructura de carpetas backend:"
ls -la backend/ 2>/dev/null || ls -la .
echo ""

# 3. Verificar que existe la carpeta public
echo "📂 Contenido de public:"
ls -la backend/public/ 2>/dev/null || ls -la public/
echo ""

# 4. Verificar que existe la carpeta css
echo "📂 Contenido de public/css:"
ls -la backend/public/css/ 2>/dev/null || ls -la public/css/
echo ""

# 5. Verificar el tamaño del archivo CSS
if [ -f "backend/public/css/styles.css" ]; then
    SIZE=$(wc -c < backend/public/css/styles.css)
    echo "✅ Archivo styles.css encontrado!"
    echo "   Tamaño: $SIZE bytes"
    if [ $SIZE -lt 10000 ]; then
        echo "   ⚠️  ADVERTENCIA: El archivo es muy pequeño (menos de 10KB)"
        echo "   Esto puede indicar que Tailwind no generó todas las clases"
    else
        echo "   ✅ Tamaño correcto"
    fi
elif [ -f "public/css/styles.css" ]; then
    SIZE=$(wc -c < public/css/styles.css)
    echo "✅ Archivo styles.css encontrado!"
    echo "   Tamaño: $SIZE bytes"
    if [ $SIZE -lt 10000 ]; then
        echo "   ⚠️  ADVERTENCIA: El archivo es muy pequeño (menos de 10KB)"
    else
        echo "   ✅ Tamaño correcto"
    fi
else
    echo "❌ ERROR: Archivo styles.css NO encontrado!"
    echo "   El CSS no se generó durante el build"
fi
echo ""

# 6. Verificar que existe dist/server.js
echo "📂 Verificando servidor compilado:"
if [ -f "backend/dist/server.js" ]; then
    echo "✅ server.js encontrado en backend/dist/"
elif [ -f "dist/server.js" ]; then
    echo "✅ server.js encontrado en dist/"
else
    echo "❌ ERROR: server.js NO encontrado!"
fi
echo ""

# 7. Verificar package.json scripts
echo "📝 Scripts de build en package.json:"
if [ -f "backend/package.json" ]; then
    grep -A 3 '"scripts"' backend/package.json | grep -E '"build"|"build:css"'
elif [ -f "package.json" ]; then
    grep -A 3 '"scripts"' package.json | grep -E '"build"|"build:css"'
fi
echo ""

# 8. Verificar tailwind.config.js
echo "📝 Verificando tailwind.config.js:"
if [ -f "backend/tailwind.config.js" ]; then
    echo "✅ tailwind.config.js encontrado"
elif [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js encontrado"
else
    echo "❌ ERROR: tailwind.config.js NO encontrado!"
fi
echo ""

# 9. Verificar views
echo "📂 Verificando carpeta views:"
if [ -d "backend/views" ]; then
    echo "✅ Carpeta views encontrada"
    echo "   Archivos EJS:"
    find backend/views -name "*.ejs" | wc -l
elif [ -d "views" ]; then
    echo "✅ Carpeta views encontrada"
    echo "   Archivos EJS:"
    find views -name "*.ejs" | wc -l
else
    echo "❌ ERROR: Carpeta views NO encontrada!"
fi
echo ""

echo "🎯 Resumen:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si todo está OK
ERRORS=0

if [ ! -f "backend/public/css/styles.css" ] && [ ! -f "public/css/styles.css" ]; then
    echo "❌ CSS no generado - Ejecuta: npm run build:css"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "backend/dist/server.js" ] && [ ! -f "dist/server.js" ]; then
    echo "❌ Servidor no compilado - Ejecuta: npm run build"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo "✅ Todo parece estar correcto!"
    echo ""
    echo "Si el CSS aún no se carga, verifica:"
    echo "1. Que el servidor esté corriendo: ps aux | grep node"
    echo "2. Que puedas acceder a: https://tu-app.onrender.com/css/styles.css"
    echo "3. Los logs del navegador (F12 > Console)"
else
    echo ""
    echo "⚠️  Se encontraron $ERRORS problema(s)"
    echo ""
    echo "Para regenerar el CSS, ejecuta:"
    echo "  cd backend && npm run build:css"
    echo ""
    echo "Para recompilar todo, ejecuta:"
    echo "  cd backend && npm run build"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
