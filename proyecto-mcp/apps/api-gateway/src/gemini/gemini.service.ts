import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, FunctionDeclaration } from '@google/generative-ai';
import { McpClient } from '../mcp-client/mcp-client.service';

/**
 * Servicio de integración con Gemini AI con Function Calling
 * Usa SOLO Gemini real - sin simulación
 */
@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;
  private tools: FunctionDeclaration[] = [];

  constructor(private readonly mcpClient: McpClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en el archivo .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async onModuleInit() {
    try {
      // Cargar herramientas disponibles del MCP Server
      await this.loadTools();
      
    
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: [{ functionDeclarations: this.tools }],
      });
      
      this.logger.log(`✓ Gemini 2.0 Flash configurado con ${this.tools.length} herramientas`);
    } catch (error: any) {
      this.logger.error('Error inicializando Gemini:', error.message);
      throw error;
    }
  }

  /**
   * Carga las herramientas desde el MCP Server y las convierte al formato de Gemini
   */
  private async loadTools() {
    const mcpTools = await this.mcpClient.listTools();

    this.tools = mcpTools.map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  /**
   * Procesa una consulta del usuario usando Gemini AI con Function Calling
   */
  async processQuery(userPrompt: string) {
    try {
      const chat = this.model.startChat();
      const executedTools: any[] = [];
      let iterations = 0;
      const maxIterations = 5;

      // Enviar mensaje inicial
      this.logger.log(`📨 Enviando mensaje a Gemini: "${userPrompt}"`);
      let result = await chat.sendMessage(userPrompt);
      let response = result.response;

      // Bucle para manejar function calls
      while (response.functionCalls && iterations < maxIterations) {
        iterations++;
        const functionResponses = [];

        for (const call of response.functionCalls) {
          this.logger.log(`🔧 Gemini solicita ejecutar: ${call.name}`, JSON.stringify(call.args));

          try {
            const toolResult = await this.mcpClient.callTool(call.name, call.args);
            
            executedTools.push({
              tool: call.name,
              arguments: call.args,
              result: toolResult,
            });

            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: toolResult,
              },
            });
          } catch (error: any) {
            this.logger.error(`❌ Error ejecutando ${call.name}:`, error.message);
            
            const errorResponse = {
              error: true,
              message: error.message,
            };

            executedTools.push({
              tool: call.name,
              arguments: call.args,
              error: error.message,
            });

            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: errorResponse,
              },
            });
          }
        }

        // Enviar resultados de vuelta a Gemini
        result = await chat.sendMessage(functionResponses);
        response = result.response;
      }

      const finalResponse = response.text();
      this.logger.log(`✅ Respuesta generada exitosamente`);

      return {
        userPrompt,
        response: finalResponse,
        toolsExecuted: executedTools,
        iterations,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('❌ Error en Gemini AI:', error.message);
      
      // Proporcionar información útil sobre el error
      if (error.message.includes('quota') || error.message.includes('429')) {
        throw new Error('Cuota de Gemini API excedida. La API gratuita tiene límites muy bajos. Intenta de nuevo más tarde o actualiza tu plan.');
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        throw new Error(`Modelo no disponible. El modelo gemini-1.5-flash no está disponible en tu región o cuenta.`);
      } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Recursos de Gemini agotados. Límite de llamadas por minuto alcanzado.');
      } else {
        throw new Error(`Error de Gemini: ${error.message}`);
      }
    }
  }

  /**
   * Obtiene información sobre las herramientas disponibles
   */
  getAvailableTools() {
    return this.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  }
}
