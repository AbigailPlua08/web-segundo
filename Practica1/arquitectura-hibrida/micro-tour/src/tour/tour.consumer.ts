import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ActualizarTourDto } from '@arquitectura/shared';
import { RabbitService } from '../rabbit/rabbit.service';
import { TourService } from './tour.service';

@Controller()
export class TourConsumer {
  private readonly logger = new Logger(TourConsumer.name);

  constructor(
    private readonly tourService: TourService,
    private readonly rabbitService: RabbitService
  ) {}

  @MessagePattern('tour.listar')
  async listar(@Ctx() context: RmqContext) {
    const result = await this.tourService.listar();
    this.rabbitService.ack(context);
    return result;
  }

  @MessagePattern('tour.crear')
  async crear(
    @Payload() payload: Record<string, unknown>,
    @Ctx() context: RmqContext
  ) {
    const result = await this.tourService.crear(payload);
    this.rabbitService.ack(context);
    return result;
  }

  @MessagePattern('tour.actualizar')
  async actualizar(
    @Payload() payload: ActualizarTourDto,
    @Ctx() context: RmqContext
  ) {
    const result = await this.tourService.actualizarDisponibilidad(payload);
    this.rabbitService.ack(context);
    return result;
  }

  @EventPattern('tour.command.queue')
  async procesarDesdeCola(@Payload() payload: any, @Ctx() context: RmqContext) {
    return this.procesarEvento(payload, context);
  }

  @EventPattern()
  async procesarSinPatron(@Payload() payload: any, @Ctx() context: RmqContext) {
    return this.procesarEvento(payload, context);
  }

  private async procesarEvento(payload: any, context: RmqContext) {
    const esActualizacion =
      typeof payload?.tourId === 'string' &&
      (typeof payload?.deltaCapacidad === 'number' ||
        typeof payload?.capacidadDisponible === 'number' ||
        typeof payload?.disponible === 'boolean');

    if (esActualizacion) {
      const dto: ActualizarTourDto = {
        tourId: payload.tourId,
        capacidadDisponible: payload.capacidadDisponible,
        deltaCapacidad: payload.deltaCapacidad,
        disponible: payload.disponible,
      };
      const result = await this.tourService.actualizarDisponibilidad(dto);
      this.rabbitService.ack(context);
      return result;
    }

    if (payload && typeof payload === 'object') {
      const result = await this.tourService.crear(
        payload as Record<string, unknown>
      );
      this.rabbitService.ack(context);
      return result;
    }

    this.logger.warn(
      'Mensaje recibido sin estructura reconocida, se descarta.'
    );
    this.rabbitService.ack(context);
    return null;
  }
}
