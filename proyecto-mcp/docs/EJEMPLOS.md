# Ejemplos de Uso - Sistema MCP Tours

Este documento contiene ejemplos prácticos de cómo interactuar con el sistema.

---

## 🎯 Casos de Uso Reales

### Caso 1: Cliente busca opciones de viaje

**Input del usuario:**
```
"Hola, estoy buscando tours al Amazonas para el próximo mes"
```

**Herramientas ejecutadas por la IA:**
1. `buscar_tour` con `query: "Amazonas"`

**Respuesta esperada:**
```
Encontré la "Aventura Amazónica" con destino a Leticia - Amazonas. 
Precio: $850 por persona, disponible del 10 al 17 de marzo de 2026. 
Hay 15 cupos disponibles. ¿Te gustaría hacer una reserva?
```

---

### Caso 2: Verificación de disponibilidad

**Input del usuario:**
```
"¿Hay espacio para 5 personas en el tour a Cartagena?"
```

**Herramientas ejecutadas:**
1. `buscar_tour` con `query: "Cartagena"`
2. `validar_disponibilidad` con `tourId: 1, numeroPasajeros: 5`

**Respuesta esperada:**
```
Sí, el Tour Cartagena Colonial tiene 20 cupos disponibles. 
Puedes reservar para 5 personas sin problema. 
El costo total sería de $2,250 (5 personas × $450).
```

---

### Caso 3: Creación de reserva completa

**Input del usuario:**
```
"Quiero reservar el tour a Cartagena para 3 personas. 
Soy María González, mi email es maria.gonzalez@email.com 
y mi teléfono es 3109876543"
```

**Herramientas ejecutadas:**
1. `buscar_tour` → Encuentra el tour
2. `validar_disponibilidad` → Confirma cupos
3. `crear_reserva` → Crea la reserva

**Respuesta esperada:**
```
¡Perfecto María! He creado tu reserva exitosamente:

📋 Detalles de la Reserva:
- Tour: Cartagena Colonial
- Destino: Cartagena de Indias
- Fechas: 15 al 20 de febrero de 2026
- Pasajeros: 3 personas
- Monto total: $1,350
- Estado: PENDIENTE

✉️ Se ha enviado la confirmación a maria.gonzalez@email.com

📌 Próximos pasos:
- Recibirás un email con los detalles
- Para confirmar definitivamente la reserva, realiza el pago
- Contactaremos al 3109876543 para coordinar detalles
```

---

### Caso 4: Consulta sin datos completos

**Input del usuario:**
```
"Quiero hacer una reserva para el tour del Amazonas"
```

**Respuesta de la IA:**
```
¡Excelente elección! El tour "Aventura Amazónica" está disponible.

Para completar tu reserva, necesito los siguientes datos:
- ¿Cuántas personas viajarán?
- Nombre completo
- Email de contacto
- Número de teléfono

¿Puedes proporcionarme esta información?
```

---

### Caso 5: Tour sin disponibilidad

**Input del usuario:**
```
"Necesito reservar para 25 personas en el tour a Cartagena"
```

**Herramientas ejecutadas:**
1. `buscar_tour`
2. `validar_disponibilidad` → Detecta que solo hay 20 cupos

**Respuesta esperada:**
```
Lamentablemente, el Tour Cartagena Colonial solo tiene 20 cupos disponibles 
y necesitas 25. 

Opciones:
1. Dividir el grupo en dos tours diferentes
2. Consultar por otros destinos con mayor capacidad
3. Contactar directamente para solicitar un tour privado

¿Qué opción prefieres?
```

---

## 🧪 Pruebas con cURL

### Prueba 1: Búsqueda Simple
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Muéstrame todos los tours disponibles"
  }'
```

### Prueba 2: Búsqueda con filtro
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Busca tours económicos menores a $500"
  }'
```

### Prueba 3: Reserva completa
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Reserva el tour a Cartagena para 2 personas. Cliente: Pedro Ramírez, email: pedro@test.com, tel: 3201234567"
  }'
```

### Prueba 4: Conversación contextual
```bash
# Mensaje 1
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Busca tours al Amazonas"}'

# Mensaje 2 (en la misma conversación)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuánto cuesta?"}'

# Mensaje 3
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Reserva para 2 personas"}'
```

---

## 📊 Ejemplos de Respuestas JSON

### Respuesta con 1 Tool ejecutado
```json
{
  "userPrompt": "Busca tours a Cartagena",
  "response": "Encontré el Tour Cartagena Colonial...",
  "toolsExecuted": [
    {
      "tool": "buscar_tour",
      "arguments": { "query": "Cartagena" },
      "result": {
        "success": true,
        "message": "Se encontraron 1 tour(s)",
        "data": [
          {
            "id": 1,
            "nombre": "Tour Cartagena Colonial",
            "destino": "Cartagena de Indias",
            "precio": 450,
            "cuposDisponibles": 20,
            "fechaSalida": "2026-02-15",
            "fechaRetorno": "2026-02-20"
          }
        ]
      }
    }
  ],
  "iterations": 1,
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

### Respuesta con 3 Tools ejecutados (flujo completo)
```json
{
  "userPrompt": "Reserva Cartagena para 2, Juan Pérez, juan@test.com, 3001234567",
  "response": "¡Reserva creada exitosamente! Detalles: ...",
  "toolsExecuted": [
    {
      "tool": "buscar_tour",
      "arguments": { "query": "Cartagena" },
      "result": { "success": true, "data": [...] }
    },
    {
      "tool": "validar_disponibilidad",
      "arguments": { "tourId": 1, "numeroPasajeros": 2 },
      "result": {
        "success": true,
        "disponible": true,
        "data": {
          "montoEstimado": 900
        }
      }
    },
    {
      "tool": "crear_reserva",
      "arguments": {
        "tourId": 1,
        "nombreCliente": "Juan Pérez",
        "emailCliente": "juan@test.com",
        "telefonoCliente": "3001234567",
        "numeroPasajeros": 2
      },
      "result": {
        "success": true,
        "data": {
          "reservaId": 1,
          "estado": "PENDIENTE",
          "montoTotal": 900
        }
      }
    }
  ],
  "iterations": 3,
  "timestamp": "2026-01-04T10:35:00.000Z"
}
```

---

## 🎭 Escenarios de Error

### Error 1: Tour no encontrado
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Busca tours a Marte"}'
```

**Respuesta:**
```
No encontré tours con ese destino. Los destinos disponibles son:
- Cartagena de Indias
- Leticia - Amazonas
```

### Error 2: Datos incompletos
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Haz una reserva"}'
```

**Respuesta:**
```
Para crear una reserva necesito:
1. ¿A qué tour deseas viajar?
2. ¿Cuántas personas?
3. Tus datos de contacto (nombre, email, teléfono)
```

---

## 🚀 Casos Avanzados

### Multi-step con confirmación
```
Usuario: "Busca tours económicos"
IA: "Encontré Tour Cartagena a $450"
Usuario: "¿Hay espacio para 4?"
IA: "Sí, hay 20 cupos disponibles"
Usuario: "Perfecto, haz la reserva. Soy Ana López, ana@test.com, 3157894561"
IA: "Reserva creada exitosamente..."
```

### Comparación de opciones
```
Usuario: "Compara los precios de todos los tours"
IA: "Tour Cartagena: $450, Tour Amazonas: $850"
Usuario: "¿Cuál tiene más cupos disponibles?"
IA: "Cartagena tiene 20 cupos, Amazonas tiene 15"
```

---

## 💡 Tips para Mejores Resultados

1. **Sea específico:** "Busca tours a Cartagena" es mejor que "Busca tours"
2. **Proporcione todos los datos:** Incluya nombre, email y teléfono en un solo mensaje
3. **Use lenguaje natural:** La IA entiende conversaciones normales
4. **Pregunte paso a paso:** Puede hacer consultas secuenciales
5. **Verifique antes de reservar:** Pregunte por disponibilidad primero

---

## 🎯 Plantillas de Mensajes

### Para búsqueda:
```
"Busca tours a [destino]"
"Muéstrame tours disponibles en [mes]"
"¿Qué tours cuestan menos de [precio]?"
```

### Para validación:
```
"¿Hay espacio para [N] personas en [tour]?"
"Verifica disponibilidad del tour a [destino]"
```

### Para reserva:
```
"Reserva [tour] para [N] personas. Nombre: [X], Email: [Y], Tel: [Z]"
"Quiero hacer una reserva al tour [destino]"
```
