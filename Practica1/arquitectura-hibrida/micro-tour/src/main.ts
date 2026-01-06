import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RabbitService } from './rabbit/rabbit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const rabbitService = app.get(RabbitService);
  const port = config.get<number>('PORT', 3001);

  app.enableShutdownHooks();

  app.connectMicroservice<MicroserviceOptions>(
    rabbitService.createMicroserviceOptions()
  );

  await app.startAllMicroservices();
  await app.listen(port);
  Logger.log(`Microservicio Tour escuchando en puerto ${port}`, 'Bootstrap');
}

bootstrap();
