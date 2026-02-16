# Script para limpiar productos de la base de datos PostgreSQL local
# Esto forzara que se vuelvan a insertar con las nuevas rutas de imagenes

Write-Host "Limpiando productos de la base de datos..." -ForegroundColor Yellow

# Conectar a PostgreSQL y eliminar todos los productos
$env:PGPASSWORD = "Bl*200906"
psql -U postgres -d powerfit -c "DELETE FROM cart_items;"
psql -U postgres -d powerfit -c "DELETE FROM products;"

Write-Host "Productos eliminados. Reinicia el servidor para que se vuelvan a insertar." -ForegroundColor Green
Write-Host ""
Write-Host "Ejecuta: npm run dev" -ForegroundColor Cyan
