# Script para limpiar la base de datos SQLite

Write-Host "Limpiando base de datos..." -ForegroundColor Yellow

$dbPath = ".\apps\backend\data\tours.db"

if (Test-Path $dbPath) {
    # Eliminar el archivo de base de datos
    Remove-Item $dbPath -Force
    Write-Host "Base de datos eliminada exitosamente" -ForegroundColor Green
    Write-Host "La base de datos se recreara automaticamente cuando reinicies el Backend" -ForegroundColor Cyan
} else {
    Write-Host "No se encontro la base de datos en $dbPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Ahora reinicia el Backend para que se cree la base de datos vacia:" -ForegroundColor Yellow
Write-Host "  cd apps\backend" -ForegroundColor White
Write-Host "  npm run start:dev" -ForegroundColor White
