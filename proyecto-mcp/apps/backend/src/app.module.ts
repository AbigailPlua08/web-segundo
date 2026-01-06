import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourModule } from './tour/tour.module';
import { ReservaModule } from './reserva/reserva.module';
import { Tour } from './tour/tour.entity';
import { Reserva } from './reserva/reserva.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/tours.db',
      entities: [Tour, Reserva],
      synchronize: true,
      logging: false,
    }),
    TourModule,
    ReservaModule,
  ],
})
export class AppModule {}
