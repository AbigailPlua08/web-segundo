import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.enableCors();

  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  console.log(`🚀 Backend ejecutándose en http://localhost:${port}`);
  console.log(`📚 Endpoints disponibles:`);
  console.log(`   GET    /tours`);
  console.log(`   GET    /tours/search?q=query`);
  console.log(`   POST   /tours`);
  console.log(`   GET    /reservas`);
  console.log(`   POST   /reservas`);
  console.log(`   POST   /reservas/:id/confirmar`);
}

bootstrap();
