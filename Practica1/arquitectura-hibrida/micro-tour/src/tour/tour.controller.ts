import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ActualizarTourDto } from '@arquitectura/shared';
import { RabbitService } from '../rabbit/rabbit.service';
import { TourService } from './tour.service';

@Controller()
export class TourController {
  constructor(
    private readonly tourService: TourService,
    private readonly rabbitService: RabbitService
  ) {}

  @MessagePattern('tour.listar')
  async listar(@Ctx() context: RmqContext) {
    const respuesta = await this.tourService.listar();
    this.rabbitService.ack(context);
    return respuesta;
  }

  @MessagePattern('tour.crear')
  async crear(@Payload() payload: unknown, @Ctx() context: RmqContext) {
    const respuesta = await this.tourService.crear(payload);
    this.rabbitService.ack(context);
    return respuesta;
  }

  @MessagePattern('tour.actualizar')
  async actualizar(
    @Payload() payload: ActualizarTourDto,
    @Ctx() context: RmqContext
  ) {
    const respuesta = await this.tourService.actualizarDisponibilidad(payload);
    this.rabbitService.ack(context);
    return respuesta;
  }
}
