import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { GeminiService } from '../gemini/gemini.service';
import { McpClient } from '../mcp-client/mcp-client.service';

@Module({
  controllers: [ChatController],
  providers: [
    GeminiService,
    {
      provide: McpClient,
      useFactory: () => {
        const mcpServerUrl = process.env.MCP_SERVER_URL || 'http://localhost:3001';
        return new McpClient(mcpServerUrl);
      },
    },
  ],
})
export class ChatModule {}
