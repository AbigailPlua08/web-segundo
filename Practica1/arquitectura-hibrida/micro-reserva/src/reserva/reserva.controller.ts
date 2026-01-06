import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { RabbitService } from '../rabbit/rabbit.service';
import { ReservaService } from './reserva.service';

@Controller()
export class ReservaController {
  constructor(
    private readonly reservaService: ReservaService,
    private readonly rabbitService: RabbitService
  ) {}

  @MessagePattern('reserva.listar')
  async listar(@Ctx() context: RmqContext) {
    const resultado = await this.reservaService.listar();
    this.rabbitService.ack(context);
    return resultado;
  }
}
