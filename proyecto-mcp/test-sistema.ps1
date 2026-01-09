# Script de Pruebas del Sistema MCP
# Ejecutar en una terminal SEPARADA mientras los servicios estan corriendo

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS SISTEMA MCP - TALLER 3   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Funcion para hacer peticiones
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "Get",
        [object]$Body = $null
    )
    
    Write-Host "Probando: $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $Method $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "Exitoso" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10 | Write-Host
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

Write-Host "=== FASE 1: VERIFICAR SERVICIOS ===" -ForegroundColor Magenta
Write-Host ""

# 1.1 Backend
Test-Endpoint -Name "Backend - Health Check" -Uri "http://localhost:3002/tours"

# 1.2 MCP Server
Test-Endpoint -Name "MCP Server - Health Check" -Uri "http://localhost:3001/health"

# 1.3 API Gateway
Test-Endpoint -Name "API Gateway - Health Check" -Uri "http://localhost:3000/chat/health"

Write-Host ""
Write-Host "=== FASE 2: CREAR DATOS DE PRUEBA ===" -ForegroundColor Magenta
Write-Host ""

# 2.1 Crear Tour 1: Cartagena
$tour1 = @{
    nombre = "Tour Cartagena Colonial"
    destino = "Cartagena de Indias"
    precio = 450.00
    cuposTotales = 20
    fechaSalida = "2026-02-15"
    fechaRetorno = "2026-02-20"
}
Test-Endpoint -Name "Crear Tour: Cartagena" -Uri "http://localhost:3002/tours" -Method Post -Body $tour1

# 2.2 Crear Tour 2: Amazonas
$tour2 = @{
    nombre = "Aventura Amazónica"
    destino = "Leticia - Amazonas"
    precio = 850.00
    cuposTotales = 15
    fechaSalida = "2026-03-10"
    fechaRetorno = "2026-03-17"
}
Test-Endpoint -Name "Crear Tour: Amazonas" -Uri "http://localhost:3002/tours" -Method Post -Body $tour2

# 2.3 Crear Tour 3: Eje Cafetero
$tour3 = @{
    nombre = "Ruta del Café"
    destino = "Eje Cafetero - Quindío"
    precio = 380.00
    cuposTotales = 25
    fechaSalida = "2026-02-20"
    fechaRetorno = "2026-02-24"
}
Test-Endpoint -Name "Crear Tour: Eje Cafetero" -Uri "http://localhost:3002/tours" -Method Post -Body $tour3

Write-Host ""
Write-Host "=== FASE 3: PROBAR MCP SERVER ===" -ForegroundColor Magenta
Write-Host ""

# 3.1 Listar Tools
$toolsList = @{
    jsonrpc = "2.0"
    method = "tools/list"
    id = 1
}
Test-Endpoint -Name "MCP - Listar Tools" -Uri "http://localhost:3001/mcp" -Method Post -Body $toolsList

# 3.2 Tool: buscar_tour
$buscarTour = @{
    jsonrpc = "2.0"
    method = "tools/call"
    params = @{
        name = "buscar_tour"
        arguments = @{
            query = "Cartagena"
        }
    }
    id = 2
}
Test-Endpoint -Name "MCP Tool - Buscar Tour" -Uri "http://localhost:3001/mcp" -Method Post -Body $buscarTour

# 3.3 Tool: validar_disponibilidad
$validarDisp = @{
    jsonrpc = "2.0"
    method = "tools/call"
    params = @{
        name = "validar_disponibilidad"
        arguments = @{
            tourId = 1
            numeroPasajeros = 5
        }
    }
    id = 3
}
Test-Endpoint -Name "MCP Tool - Validar Disponibilidad" -Uri "http://localhost:3001/mcp" -Method Post -Body $validarDisp

Write-Host ""
Write-Host "=== FASE 4: PROBAR API GATEWAY CON GEMINI ===" -ForegroundColor Magenta
Write-Host ""

# 4.1 Listar herramientas disponibles
Test-Endpoint -Name "Gateway - Listar Tools" -Uri "http://localhost:3000/chat/tools"

# 4.2 Prueba 1: Búsqueda simple
$chat1 = @{
    message = "Muéstrame todos los tours disponibles"
}
Test-Endpoint -Name "Chat - Listar Tours" -Uri "http://localhost:3000/chat" -Method Post -Body $chat1

Start-Sleep -Seconds 2

# 4.3 Prueba 2: Búsqueda específica
$chat2 = @{
    message = "Busca tours a Cartagena"
}
Test-Endpoint -Name "Chat - Buscar Cartagena" -Uri "http://localhost:3000/chat" -Method Post -Body $chat2

Start-Sleep -Seconds 2

# 4.4 Prueba 3: Validación de disponibilidad
$chat3 = @{
    message = "¿Hay espacio para 5 personas en el tour a Cartagena?"
}
Test-Endpoint -Name "Chat - Validar Disponibilidad" -Uri "http://localhost:3000/chat" -Method Post -Body $chat3

Start-Sleep -Seconds 2

# 4.5 Prueba 4: Crear reserva (END-TO-END)
$chat4 = @{
    message = "Quiero reservar el tour a Cartagena para 2 personas. Mi nombre es Juan Pérez, email juan.perez@test.com, teléfono 3201234567"
}
Test-Endpoint -Name "Chat - Crear Reserva Completa" -Uri "http://localhost:3000/chat" -Method Post -Body $chat4

Write-Host ""
Write-Host "=== FASE 5: VERIFICAR RESULTADOS ===" -ForegroundColor Magenta
Write-Host ""

# 5.1 Listar todas las reservas creadas
Test-Endpoint -Name "Backend - Listar Reservas" -Uri "http://localhost:3002/reservas"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS COMPLETADAS              " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resumen de lo probado:" -ForegroundColor Yellow
Write-Host "- Backend (CRUD directo)" -ForegroundColor Green
Write-Host "- MCP Server (JSON-RPC Tools)" -ForegroundColor Green
Write-Host "- API Gateway (Gemini IA)" -ForegroundColor Green
Write-Host "- Integracion End-to-End" -ForegroundColor Green
Write-Host ""
Write-Host "Para el video demostrativo, muestra:" -ForegroundColor Cyan
Write-Host "1. Los 3 servicios corriendo en terminales separadas" -ForegroundColor White
Write-Host "2. Ejecuta este script de pruebas" -ForegroundColor White
Write-Host "3. Muestra las respuestas de Gemini AI" -ForegroundColor White
Write-Host "4. Verifica la base de datos con las reservas creadas" -ForegroundColor White
