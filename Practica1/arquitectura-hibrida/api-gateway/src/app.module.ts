import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReservaController } from './reserva/reserva.controller';
import { ReservaService } from './reserva/reserva.service';
import { TourController } from './tour/tour.controller';
import { TourService } from './tour/tour.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: 'TOUR_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>(
                'RABBITMQ_URL',
                'amqp://guest:guest@localhost:5672'
              ),
            ],
            queue: config.get<string>('TOUR_QUEUE', 'tour.command.queue'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'RESERVA_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              config.get<string>(
                'RABBITMQ_URL',
                'amqp://guest:guest@localhost:5672'
              ),
            ],
            queue: config.get<string>('RESERVA_QUEUE', 'reserva.command.queue'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [TourController, ReservaController],
  providers: [TourService, ReservaService],
})
export class AppModule {}
