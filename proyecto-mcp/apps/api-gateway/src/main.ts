import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         API GATEWAY - Gemini AI Integration           ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`🚀 Gateway ejecutándose en http://localhost:${port}`);
  console.log(`🤖 Modelo: Gemini 2.0 Flash`);
  console.log(`📡 MCP Server: ${process.env.MCP_SERVER_URL}`);
  console.log('');
  console.log('Endpoints disponibles:');
  console.log(`  POST   http://localhost:${port}/chat`);
  console.log(`  GET    http://localhost:${port}/chat/tools`);
  console.log(`  GET    http://localhost:${port}/chat/health`);
  console.log('════════════════════════════════════════════════════════');
  console.log('');
  console.log('💡 Ejemplo de uso:');
  console.log(`  curl -X POST http://localhost:${port}/chat \\`);
  console.log(`       -H "Content-Type: application/json" \\`);
  console.log(`       -d '{"message": "Busca tours a Cartagena"}'`);
  console.log('');
}

bootstrap();
