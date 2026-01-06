import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { TourController } from './tour/tour.controller';
import { TourConsumer } from './tour/tour.consumer';
import { TourEntity } from './tour/tour.entity';
import { TourRepository } from './tour/tour.repository';
import { TourService } from './tour/tour.service';
import { RabbitModule } from './rabbit/rabbit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RabbitModule,
    TypeOrmModule.forFeature([TourEntity]),
  ],
  controllers: [TourController, TourConsumer],
  providers: [TourService, TourRepository],
})
export class AppModule {}
