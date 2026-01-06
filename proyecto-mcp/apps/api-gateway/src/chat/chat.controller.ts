import { Controller, Post, Get, Body } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { McpClient } from '../mcp-client/mcp-client.service';
import { ChatRequestDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly mcpClient: McpClient,
  ) {}

  /**
   * Endpoint principal - Envía un mensaje y obtiene respuesta de la IA
   */
  @Post()
  async chat(@Body() chatRequest: ChatRequestDto) {
    try {
      const result = await this.geminiService.processQuery(chatRequest.message);
      return result;
    } catch (error: any) {
      console.error('Error en chat endpoint:', error.message);
      return {
        userPrompt: chatRequest.message,
        response: `Error procesando la solicitud: ${error.message}`,
        error: true,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Obtiene información sobre las herramientas disponibles
   */
  @Get('tools')
  async getTools() {
    return {
      tools: this.geminiService.getAvailableTools(),
      description: 'Herramientas disponibles para la IA',
    };
  }

  /**
   * Verifica el estado de la conexión con MCP Server
   */
  @Get('health')
  async health() {
    try {
      const ping = await this.mcpClient.ping();
      return {
        status: 'healthy',
        mcpServer: ping,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
