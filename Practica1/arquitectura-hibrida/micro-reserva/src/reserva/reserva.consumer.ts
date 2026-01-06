import { BadRequestException, Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CrearReservaDto } from '@arquitectura/shared';
import { IdempotenciaService } from '../idempotencia/idempotencia.service';
import { RabbitService } from '../rabbit/rabbit.service';
import { ReservaService } from './reserva.service';

@Controller()
export class ReservaConsumer {
  constructor(
    private readonly reservaService: ReservaService,
    private readonly idempotenciaService: IdempotenciaService,
    private readonly rabbitService: RabbitService
  ) {}

  @MessagePattern('reserva.crear')
  async crear(@Payload() payload: CrearReservaDto, @Ctx() context: RmqContext) {
    return this.procesarReserva(payload, context);
  }

  @EventPattern('reserva.command.queue')
  async procesar(
    @Payload() payload: CrearReservaDto,
    @Ctx() context: RmqContext
  ) {
    return this.procesarReserva(payload, context);
  }

  @EventPattern()
  async procesarSinPatron(
    @Payload() payload: CrearReservaDto,
    @Ctx() context: RmqContext
  ) {
    return this.procesarReserva(payload, context);
  }

  private async procesarReserva(payload: CrearReservaDto, context: RmqContext) {
    if (!payload.idempotencyKey) {
      throw new BadRequestException('El mensaje debe incluir idempotencyKey');
    }

    const { result, duplicate } = await this.idempotenciaService.execute(
      payload.idempotencyKey,
      () => this.reservaService.crear(payload)
    );

    this.rabbitService.ack(context);
    return { ...result, idempotentReplay: duplicate };
  }
}
