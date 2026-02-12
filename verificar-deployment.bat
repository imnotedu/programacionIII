@echo off
echo ========================================
echo   VERIFICACION PRE-DEPLOYMENT
echo ========================================
echo.

echo [1/5] Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo OK - Node.js instalado
echo.

echo [2/5] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)
echo OK - Dependencias instaladas
echo.

echo [3/5] Compilando frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo la compilacion del frontend
    pause
    exit /b 1
)
echo OK - Frontend compilado
echo.

echo [4/5] Compilando backend...
call npm run build:backend
if %errorlevel% neq 0 (
    echo ERROR: Fallo la compilacion del backend
    pause
    exit /b 1
)
echo OK - Backend compilado
echo.

echo [5/5] Verificando archivos generados...
if not exist "dist\index.html" (
    echo ERROR: No se genero dist\index.html
    pause
    exit /b 1
)
if not exist "backend\dist\server.js" (
    echo ERROR: No se genero backend\dist\server.js
    pause
    exit /b 1
)
echo OK - Archivos generados correctamente
echo.

echo ========================================
echo   VERIFICACION COMPLETADA
echo ========================================
echo.
echo Todo esta listo para el deployment!
echo.
echo Proximos pasos:
echo 1. Sube los cambios a GitHub: git add . ^&^& git commit -m "Ready for deployment" ^&^& git push
echo 2. Sigue la guia GUIA_DEPLOYMENT_PASO_A_PASO.md
echo.
pause
