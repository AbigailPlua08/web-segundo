# 🚀 Iniciando Sistema MCP - Tours y Reservas

Write-Host "Iniciando todos los servicios..." -ForegroundColor Green
Write-Host ""

# Backend
Write-Host "Backend (Puerto 3002)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\backend'; npm run start:dev"

Start-Sleep -Seconds 2

# MCP Server
Write-Host "MCP Server (Puerto 3001)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\mcp-server'; npm run dev"

Start-Sleep -Seconds 2

# API Gateway
Write-Host "API Gateway (Puerto 3000)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\api-gateway'; npm run start:dev"

Write-Host ""
Write-Host "Servicios iniciando en terminales separadas" -ForegroundColor Green
Write-Host "Endpoints: Backend(3002), MCP(3001), Gateway(3000)" -ForegroundColor Yellow
