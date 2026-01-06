import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './reserva.entity';
import { ReservaController } from './reserva.controller';
import { ReservaService } from './reserva.service';
import { TourModule } from '../tour/tour.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva]),
    TourModule,
  ],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService],
})
export class ReservaModule {}
