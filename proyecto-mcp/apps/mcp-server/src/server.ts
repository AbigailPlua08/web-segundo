import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BackendClient } from './services/backend-client';
import { ToolRegistry } from './tools/registry';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar servicios
const backendClient = new BackendClient(BACKEND_URL);
const toolRegistry = new ToolRegistry(backendClient);

/**
 * JSON-RPC 2.0 Request/Response Types
 */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

/**
 * Middleware para logging de requests
 */
app.use((req: Request, res: Response, next: any) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Endpoint principal JSON-RPC 2.0
 */
app.post('/mcp', async (req: Request, res: Response) => {
  const request: JsonRpcRequest = req.body;

  // Validar JSON-RPC 2.0
  if (request.jsonrpc !== '2.0') {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32600,
        message: 'Invalid Request: jsonrpc must be "2.0"',
      },
      id: null,
    };
    return res.status(400).json(errorResponse);
  }

  try {
    // Manejar diferentes métodos MCP
    switch (request.method) {
      case 'tools/list':
        return handleListTools(request, res);
      
      case 'tools/call':
        return await handleCallTool(request, res);
      
      case 'ping':
        return handlePing(request, res);
      
      default:
        const errorResponse: JsonRpcResponse = {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${request.method}`,
          },
          id: request.id || null,
        };
        return res.status(404).json(errorResponse);
    }
  } catch (error: any) {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message,
      },
      id: request.id || null,
    };
    return res.status(500).json(errorResponse);
  }
});

/**
 * Maneja tools/list - Lista todas las herramientas disponibles
 */
function handleListTools(request: JsonRpcRequest, res: Response) {
  const response: JsonRpcResponse = {
    jsonrpc: '2.0',
    result: {
      tools: toolRegistry.getToolDefinitions(),
    },
    id: request.id || null,
  };
  
  res.json(response);
}

/**
 * Maneja tools/call - Ejecuta una herramienta específica
 */
async function handleCallTool(request: JsonRpcRequest, res: Response) {
  const { name, arguments: params } = request.params || {};

  if (!name) {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: 'Invalid params: "name" is required',
      },
      id: request.id || null,
    };
    return res.status(400).json(errorResponse);
  }

  if (!toolRegistry.hasTool(name)) {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32602,
        message: `Tool "${name}" not found`,
        data: {
          availableTools: toolRegistry.getToolNames(),
        },
      },
      id: request.id || null,
    };
    return res.status(400).json(errorResponse);
  }

  try {
    console.log(`Ejecutando tool: ${name}`, params);
    const result = await toolRegistry.executeTool(name, params);

    const response: JsonRpcResponse = {
      jsonrpc: '2.0',
      result: {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      },
      id: request.id || null,
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: JsonRpcResponse = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: `Tool execution failed: ${error.message}`,
        data: error.response?.data || error.stack,
      },
      id: request.id || null,
    };
    res.status(500).json(errorResponse);
  }
}

/**
 * Maneja ping - Verifica que el servidor esté activo
 */
function handlePing(request: JsonRpcRequest, res: Response) {
  const response: JsonRpcResponse = {
    jsonrpc: '2.0',
    result: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      availableTools: toolRegistry.getToolNames(),
    },
    id: request.id || null,
  };
  
  res.json(response);
}

/**
 * Health check endpoint (no JSON-RPC)
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'MCP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    backend: BACKEND_URL,
    tools: toolRegistry.getToolNames(),
  });
});

/**
 * Root endpoint con documentación
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'MCP Server - Tours y Reservas',
    version: '1.0.0',
    protocol: 'JSON-RPC 2.0',
    endpoints: {
      main: 'POST /mcp',
      health: 'GET /health',
    },
    methods: [
      {
        name: 'tools/list',
        description: 'Lista todas las herramientas disponibles',
        example: {
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
        },
      },
      {
        name: 'tools/call',
        description: 'Ejecuta una herramienta específica',
        example: {
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'buscar_tour',
            arguments: { query: 'Cartagena' },
          },
          id: 2,
        },
      },
      {
        name: 'ping',
        description: 'Verifica estado del servidor',
        example: {
          jsonrpc: '2.0',
          method: 'ping',
          id: 3,
        },
      },
    ],
    availableTools: toolRegistry.getToolNames(),
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        MCP SERVER - Model Context Protocol            ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log(`🛠️  Tools disponibles: ${toolRegistry.getToolNames().join(', ')}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST   http://localhost:${PORT}/mcp`);
  console.log(`  GET    http://localhost:${PORT}/health`);
  console.log(`  GET    http://localhost:${PORT}/`);
  console.log('════════════════════════════════════════════════════════');
});

export default app;
