# ✅ Checklist de Instalación y Verificación

## 1. Instalación de Dependencias

### Backend
```powershell
cd apps\backend
npm install
npm run build
```
**Estado:** ✅ Completado

### MCP Server
```powershell
cd apps\mcp-server
npm install
npm run build
```
**Estado:** ✅ Completado

### API Gateway
```powershell
cd apps\api-gateway
npm install
npm run build
```
**Estado:** ✅ Completado

---

## 2. Configuración

### API Gateway - Gemini API Key
```powershell
cd apps\api-gateway
notepad .env
```

Agregar tu API Key:
```env
PORT=3000
MCP_SERVER_URL=http://localhost:3001
GEMINI_API_KEY=TU_API_KEY_AQUI
```

**Obtener API Key:** https://aistudio.google.com/app/apikey

---

## 3. Ejecutar el Sistema

### Opción 1: Script Automático (Recomendado)
```powershell
.\start-all.ps1
```

### Opción 2: Manual (3 terminales separadas)

**Terminal 1 - Backend:**
```powershell
cd apps\backend
npm run start:dev
```

**Terminal 2 - MCP Server:**
```powershell
cd apps\mcp-server
npm run dev
```

**Terminal 3 - API Gateway:**
```powershell
cd apps\api-gateway
npm run start:dev
```

---

## 4. Insertar Datos de Prueba

```powershell
# Tour 1: Cartagena
curl -X POST http://localhost:3002/tours -H "Content-Type: application/json" -d '{\"nombre\":\"Tour Cartagena Colonial\",\"destino\":\"Cartagena de Indias\",\"precio\":450,\"cuposTotales\":20,\"fechaSalida\":\"2026-02-15\",\"fechaRetorno\":\"2026-02-20\"}'

# Tour 2: Amazonas
curl -X POST http://localhost:3002/tours -H "Content-Type: application/json" -d '{\"nombre\":\"Aventura Amazónica\",\"destino\":\"Leticia - Amazonas\",\"precio\":850,\"cuposTotales\":15,\"fechaSalida\":\"2026-03-10\",\"fechaRetorno\":\"2026-03-17\"}'

# Tour 3: Eje Cafetero
curl -X POST http://localhost:3002/tours -H "Content-Type: application/json" -d '{\"nombre\":\"Ruta del Café\",\"destino\":\"Eje Cafetero - Quindío\",\"precio\":380,\"cuposTotales\":25,\"fechaSalida\":\"2026-02-20\",\"fechaRetorno\":\"2026-02-24\"}'
```

---

## 5. Verificación del Sistema

### Test 1: Backend
```powershell
curl http://localhost:3002/tours
```
**Esperado:** Array con 3 tours

### Test 2: MCP Server
```powershell
curl http://localhost:3001/health
```
**Esperado:** `{ "status": "healthy", "tools": [...] }`

### Test 3: API Gateway
```powershell
curl http://localhost:3000/chat/health
```
**Esperado:** `{ "status": "healthy", "mcpServer": {...} }`

### Test 4: IA - Búsqueda
```powershell
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{\"message\": \"Busca tours a Cartagena\"}'
```
**Esperado:** Respuesta con información del tour y `toolsExecuted`

### Test 5: IA - Reserva Completa
```powershell
curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{\"message\": \"Reserva el tour a Cartagena para 2 personas. Soy Juan Pérez, email juan@test.com, teléfono 3001234567\"}'
```
**Esperado:** Reserva creada exitosamente

---

## 6. Problemas Comunes

### Error: "Cannot find module"
**Solución:** Verificar que ejecutaste `npm install` en cada carpeta

### Error: "Port already in use"
**Solución:** 
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3000

# Cambiar puerto en .env
PORT=3005
```

### Error: "GEMINI_API_KEY not found"
**Solución:** Crear archivo `.env` en `apps/api-gateway` con tu API Key

### Error: "Database locked"
**Solución:** Cerrar todas las instancias de Node y reiniciar

---

## 7. Estado Final

✅ Backend compilado sin errores  
✅ MCP Server compilado sin errores  
✅ API Gateway compilado sin errores  
✅ Dependencias instaladas  
✅ TypeScript configurado correctamente  
✅ Documentación completa  

**Sistema listo para ejecutar y demostrar** 🎉
