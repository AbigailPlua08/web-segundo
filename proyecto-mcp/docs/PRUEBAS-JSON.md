# Pruebas del Sistema MCP - JSONs para Postman/Thunder Client

## 1. BACKEND - Puerto 3002

### 1.1 Listar Tours
```
GET http://localhost:3002/tours
```

### 1.2 Crear Tour - Cartagena
```
POST http://localhost:3002/tours
Content-Type: application/json

{
  "nombre": "Tour Cartagena Colonial",
  "destino": "Cartagena de Indias",
  "precio": 450.00,
  "cuposTotales": 20,
  "fechaSalida": "2026-02-15",
  "fechaRetorno": "2026-02-20"
}
```

### 1.3 Crear Tour - Amazonas
```
POST http://localhost:3002/tours
Content-Type: application/json

{
  "nombre": "Aventura Amazónica",
  "destino": "Leticia - Amazonas",
  "precio": 850.00,
  "cuposTotales": 15,
  "fechaSalida": "2026-03-10",
  "fechaRetorno": "2026-03-17"
}
```

### 1.4 Crear Tour - Eje Cafetero
```
POST http://localhost:3002/tours
Content-Type: application/json

{
  "nombre": "Ruta del Café",
  "destino": "Eje Cafetero - Quindío",
  "precio": 380.00,
  "cuposTotales": 25,
  "fechaSalida": "2026-02-20",
  "fechaRetorno": "2026-02-24"
}
```

### 1.5 Buscar Tours
```
GET http://localhost:3002/tours/search?q=Cartagena
```

### 1.6 Validar Disponibilidad
```
GET http://localhost:3002/tours/1/disponibilidad?cantidad=5
```

### 1.7 Crear Reserva Manual
```
POST http://localhost:3002/reservas
Content-Type: application/json

{
  "tourId": 1,
  "nombreCliente": "María González",
  "emailCliente": "maria.gonzalez@test.com",
  "telefonoCliente": "3101234567",
  "numeroPasajeros": 2
}
```

### 1.8 Listar Reservas
```
GET http://localhost:3002/reservas
```

---

## 2. MCP SERVER - Puerto 3001 (JSON-RPC 2.0)

### 2.1 Health Check
```
GET http://localhost:3001/health
```

### 2.2 Listar Tools Disponibles
```
POST http://localhost:3001/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

### 2.3 Tool: buscar_tour
```
POST http://localhost:3001/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "buscar_tour",
    "arguments": {
      "query": "Cartagena"
    }
  },
  "id": 2
}
```

### 2.4 Tool: validar_disponibilidad
```
POST http://localhost:3001/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "validar_disponibilidad",
    "arguments": {
      "tourId": 1,
      "numeroPasajeros": 5
    }
  },
  "id": 3
}
```

### 2.5 Tool: crear_reserva
```
POST http://localhost:3001/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "crear_reserva",
    "arguments": {
      "tourId": 1,
      "nombreCliente": "Pedro Ramírez",
      "emailCliente": "pedro.ramirez@test.com",
      "telefonoCliente": "3209876543",
      "numeroPasajeros": 3
    }
  },
  "id": 4
}
```

---

## 3. API GATEWAY - GEMINI AI - Puerto 3000

### 3.1 Health Check
```
GET http://localhost:3000/chat/health
```

### 3.2 Listar Tools
```
GET http://localhost:3000/chat/tools
```

### 3.3 Chat: Listar Todos los Tours
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Muéstrame todos los tours disponibles"
}
```

### 3.4 Chat: Buscar Tours a Cartagena
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Busca tours a Cartagena"
}
```

### 3.5 Chat: Validar Disponibilidad
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "¿Hay espacio para 5 personas en el tour a Cartagena?"
}
```

### 3.6 Chat: RESERVA COMPLETA (END-TO-END) ⭐
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Quiero reservar el tour a Cartagena para 2 personas. Mi nombre es Juan Pérez, email juan.perez@test.com, teléfono 3201234567"
}
```

### 3.7 Chat: Consultar Precio
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "¿Cuánto cuesta el tour al Amazonas?"
}
```

### 3.8 Chat: Tour Más Económico
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "¿Cuál es el tour más económico?"
}
```

### 3.9 Chat: Consulta Compleja
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Quiero un tour para 4 personas en febrero, que no sea muy caro"
}
```

### 3.10 Chat: Reserva para Familia
```
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "Necesito reservar el tour del Eje Cafetero para mi familia de 4 personas. Soy Ana López, mi email es ana.lopez@gmail.com y mi teléfono es 3157894561"
}
```

---

## 📋 ORDEN DE EJECUCIÓN RECOMENDADO

### Paso 1: Verificar Servicios
1. Backend Health: `GET http://localhost:3002/tours`
2. MCP Health: `GET http://localhost:3001/health`
3. Gateway Health: `GET http://localhost:3000/chat/health`

### Paso 2: Crear Datos (Backend)
1. Crear Tour Cartagena (1.2)
2. Crear Tour Amazonas (1.3)
3. Crear Tour Eje Cafetero (1.4)
4. Verificar: Listar Tours (1.1)

### Paso 3: Probar MCP Server
1. Listar Tools (2.2)
2. Buscar tour (2.3)
3. Validar disponibilidad (2.4)
4. Crear reserva (2.5)

### Paso 4: Probar Gemini AI (Lo más importante)
1. Listar tools (3.2)
2. Buscar Cartagena (3.4)
3. Validar disponibilidad (3.5)
4. **RESERVA COMPLETA END-TO-END** (3.6) ⭐

### Paso 5: Verificar Resultados
1. Listar reservas: `GET http://localhost:3002/reservas`
2. Verificar base de datos SQLite

---