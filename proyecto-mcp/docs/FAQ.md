# Preguntas Frecuentes (FAQ)

## 🔧 Instalación y Configuración

### ¿Dónde obtengo la API Key de Gemini?
1. Ir a https://aistudio.google.com/app/apikey
2. Iniciar sesión con cuenta de Google
3. Click en "Create API Key"
4. Copiar la key y pegarla en `apps/api-gateway/.env`

### ¿Es gratuito Gemini?
Sí, Gemini 2.0 Flash tiene un tier gratuito generoso que es suficiente para desarrollo y pruebas.

### ¿Qué versión de Node.js necesito?
Node.js 20 o superior. Verificar con: `node --version`

---

## 🐛 Errores Comunes

### Error: "Cannot connect to backend"
**Causa:** El Backend no está corriendo o está en otro puerto  
**Solución:**
```bash
# Verificar que esté corriendo
curl http://localhost:3002/tours

# Si no responde, iniciar
cd apps/backend
npm run start:dev
```

### Error: "GEMINI_API_KEY not found"
**Causa:** No configuraste el archivo .env  
**Solución:**
```bash
cd apps/api-gateway
cp .env.example .env
# Editar .env y agregar tu API Key
```

### Error: "Port 3000 already in use"
**Causa:** Ya hay algo corriendo en ese puerto  
**Solución:**
```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3000

# Opción 1: Matar el proceso
taskkill /PID <numero> /F

# Opción 2: Cambiar puerto en .env
PORT=3005
```

### Error: "Tool execution failed"
**Causa:** El Backend no tiene datos o el MCP Server no puede conectarse  
**Solución:**
```bash
# 1. Verificar que Backend tenga tours
curl http://localhost:3002/tours

# 2. Si está vacío, insertar datos
# Usar script setup-data.ps1 o insertar manualmente

# 3. Verificar conectividad del MCP Server
curl http://localhost:3001/health
```

### Error: "SQLite database locked"
**Causa:** Múltiples instancias del Backend corriendo  
**Solución:**
```powershell
# Cerrar todas las instancias de Node
Get-Process node | Stop-Process -Force

# Reiniciar solo el Backend
cd apps/backend
npm run start:dev
```

---

## 💡 Uso del Sistema

### ¿Cómo formulo buenas preguntas a la IA?
**Ejemplos buenos:**
- "Busca tours a Cartagena"
- "¿Hay espacio para 3 personas en el tour del Amazonas?"
- "Reserva para 2, Juan Pérez, juan@email.com, tel 3001234567"

**Ejemplos malos:**
- "Hola" (muy vago)
- "haz algo" (sin contexto)
- Solo emojis

### ¿La IA mantiene contexto entre mensajes?
No en la implementación actual. Cada request es independiente. Para mantener contexto necesitarías implementar un sistema de sesiones.

### ¿Puedo agregar más Tools?
Sí, edita estos archivos:
1. Crear nuevo archivo en `apps/mcp-server/src/tools/mi-tool.tool.ts`
2. Registrarlo en `apps/mcp-server/src/tools/registry.ts`
3. La IA automáticamente lo detectará

---

## 📊 Base de Datos

### ¿Dónde está la base de datos?
`apps/backend/data/tours.db` (se crea automáticamente)

### ¿Cómo resetear la base de datos?
```bash
# Detener el Backend
# Eliminar la base de datos
rm apps/backend/data/tours.db

# Reiniciar Backend (creará DB nueva)
cd apps/backend
npm run start:dev

# Insertar datos nuevos
# Usar setup-data.ps1
```

### ¿Puedo usar PostgreSQL en vez de SQLite?
Sí, modificar `apps/backend/src/app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'usuario',
  password: 'password',
  database: 'tours_db',
  entities: [Tour, Reserva],
  synchronize: true,
})
```

---

## 🔐 Seguridad

### ¿Es seguro exponer la API Key en .env?
El archivo `.env` debe estar en `.gitignore` y NUNCA subirlo a Git. Para producción, usar variables de entorno del sistema o servicios como Azure Key Vault.

### ¿Cómo protejo los endpoints?
Implementar autenticación en los controladores:
```typescript
@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController { ... }
```

---

## 🚀 Despliegue

### ¿Cómo despliego esto en producción?
Opciones:
1. **Docker:** Crear Dockerfile para cada componente
2. **Railway/Render:** Deploy directo desde GitHub
3. **Azure:** App Services para cada microservicio
4. **AWS:** EC2 o Lambda

### ¿Necesito 3 servidores separados?
Para desarrollo sí (separación de concerns). Para producción podrías unificar, pero se pierde la modularidad.

---

## 🎓 Conceptos

### ¿Qué es MCP?
Model Context Protocol: protocolo que permite a modelos de IA interactuar con herramientas externas de manera estandarizada.

### ¿Qué es JSON-RPC 2.0?
Protocolo de llamada a procedimientos remotos usando JSON. Más ligero que REST para comunicación entre servicios.

### ¿Qué es Function Calling?
Característica de modelos de IA (como Gemini) que permite ejecutar funciones basándose en la intención del usuario.

### ¿Por qué 3 capas?
- **Backend:** Lógica de negocio reutilizable
- **MCP Server:** Adaptador entre IA y lógica de negocio
- **Gateway:** Interfaz con el usuario y la IA

---

## 📝 Personalización

### ¿Cómo cambio el dominio de Tours a otro?
1. Modificar entidades en `apps/backend/src/`
2. Actualizar Tools en `apps/mcp-server/src/tools/`
3. Cambiar descripciones para que la IA entienda el nuevo dominio

### ¿Puedo usar otro modelo de IA en vez de Gemini?
Sí, modificar `apps/api-gateway/src/gemini/gemini.service.ts` para usar:
- OpenAI GPT-4
- Anthropic Claude
- Azure OpenAI

---

## 🔍 Debugging

### ¿Cómo veo los logs?
Cada terminal muestra logs. Para más detalle:
```typescript
// En cualquier service
console.log('Debug:', data);
```

### ¿Cómo pruebo Tools individualmente?
Usar Postman con el endpoint del MCP Server:
```bash
POST http://localhost:3001/mcp
Body: {"jsonrpc":"2.0","method":"tools/call","params":{...}}
```

### ¿Cómo sé qué Tools ejecutó la IA?
La respuesta del Gateway incluye `toolsExecuted`:
```json
{
  "toolsExecuted": [
    {"tool": "buscar_tour", "arguments": {...}, "result": {...}}
  ]
}
```

---

## 📚 Recursos Adicionales

### Documentación oficial:
- MCP: https://modelcontextprotocol.io
- Gemini: https://ai.google.dev/gemini-api/docs
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io

### Videos recomendados:
- "What is MCP?" - Anthropic
- "Gemini Function Calling" - Google Cloud

---

## 💬 Soporte

### ¿Dónde reporto bugs?
En el repositorio del proyecto o con el docente.

### ¿Puedo modificar el código?
Sí, es un proyecto académico. Experimenta y aprende.
