# Guía Rápida de Inicio

Pasos mínimos para ejecutar el proyecto.

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar dependencias

```bash
cd Parcial2/Practica3/proyecto-mcp

# Backend
cd apps/backend && npm install && cd ../..

# MCP Server
cd apps/mcp-server && npm install && cd ../..

# API Gateway
cd apps/api-gateway && npm install && cd ../..
```

### 2. Configurar Gemini API Key

```bash
# Obtener key en: https://aistudio.google.com/app/apikey

# Editar archivo .env
cd apps/api-gateway
notepad .env
# Pegar tu API Key en GEMINI_API_KEY=
```

### 3. Iniciar servicios (3 terminales)

**Terminal 1:**
```powershell
cd apps/backend
npm run start:dev
```

**Terminal 2:**
```powershell
cd apps/mcp-server
npm run dev
```

**Terminal 3:**
```powershell
cd apps/api-gateway
npm run start:dev
```

### 4. Insertar datos de prueba

```bash
# Tour 1
curl -X POST http://localhost:3002/tours -H "Content-Type: application/json" -d "{\"nombre\":\"Tour Cartagena Colonial\",\"destino\":\"Cartagena de Indias\",\"precio\":450,\"cuposTotales\":20,\"fechaSalida\":\"2026-02-15\",\"fechaRetorno\":\"2026-02-20\"}"

# Tour 2
curl -X POST http://localhost:3002/tours -H "Content-Type: application/json" -d "{\"nombre\":\"Aventura Amazónica\",\"destino\":\"Leticia - Amazonas\",\"precio\":850,\"cuposTotales\":15,\"fechaSalida\":\"2026-03-10\",\"fechaRetorno\":\"2026-03-17\"}"
```

### 5. Probar la IA

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Busca tours a Cartagena\"}"
```

---

## 🎯 Prueba Completa

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Reserva el tour a Cartagena para 2 personas. Soy Juan Pérez, email juan@test.com, teléfono 3001234567\"}"
```

**Resultado esperado:**
- Búsqueda del tour ✅
- Validación de disponibilidad ✅
- Creación de reserva ✅

---

## 📝 Verificación

```bash
# Verificar servicios
curl http://localhost:3002/tours
curl http://localhost:3001/health
curl http://localhost:3000/chat/health
```

✅ **¡Listo! El sistema está funcionando.**

---

## 🚨 Problemas Comunes

**Puerto ocupado:**
```powershell
# Cambiar puerto en el archivo .env de cada app
# Backend: PORT=3003
# MCP: PORT=3004
# Gateway: PORT=3005
```

**API Key inválida:**
```bash
# Verificar en https://aistudio.google.com/app/apikey
# Regenerar si es necesario
```

**Base de datos no se crea:**
```bash
cd apps/backend
mkdir data
# El backend creará automáticamente tours.db al iniciar
```
