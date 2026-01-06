import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { IdempotenciaModule } from './idempotencia/idempotencia.module';
import { RabbitModule } from './rabbit/rabbit.module';
import { ReservaController } from './reserva/reserva.controller';
import { ReservaConsumer } from './reserva/reserva.consumer';
import { ReservaEntity } from './reserva/reserva.entity';
import { ReservaRepository } from './reserva/reserva.repository';
import { ReservaService } from './reserva/reserva.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RabbitModule,
    IdempotenciaModule,
    TypeOrmModule.forFeature([ReservaEntity]),
  ],
  controllers: [ReservaController, ReservaConsumer],
  providers: [ReservaService, ReservaRepository],
})
export class AppModule {}
