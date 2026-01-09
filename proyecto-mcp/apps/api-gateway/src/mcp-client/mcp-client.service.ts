import axios, { AxiosInstance } from 'axios';

/**
 * Cliente para comunicarse con el MCP Server vía JSON-RPC 2.0
 */
export class McpClient {
  private client: AxiosInstance;
  private requestId = 0;

  constructor(mcpServerUrl: string) {
    this.client = axios.create({
      baseURL: mcpServerUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Lista todas las herramientas disponibles en el MCP Server
   */
  async listTools() {
    const response = await this.client.post('/mcp', {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: ++this.requestId,
    });

    return response.data.result.tools;
  }

  /**
   * Ejecuta una herramienta específica
   */
  async callTool(name: string, args: any) {
    const response = await this.client.post('/mcp', {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
      id: ++this.requestId,
    });

    if (response.data.error) {
      throw new Error(response.data.error.message);
    }

    // Extraer el texto del resultado
    const content = response.data.result.content;
    if (content && content[0]?.type === 'text') {
      return JSON.parse(content[0].text);
    }

    return response.data.result;
  }

  /**
   * Verifica la conexión con el MCP Server
   */
  async ping() {
    const response = await this.client.post('/mcp', {
      jsonrpc: '2.0',
      method: 'ping',
      id: ++this.requestId,
    });

    return response.data.result;
  }
}
