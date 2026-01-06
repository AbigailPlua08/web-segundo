import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { CrearReservaDto } from '@arquitectura/shared';
import { ReservaService } from './reserva.service';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Get()
  listar() {
    return this.reservaService.listar();
  }

  @Post()
  crear(
    @Body() body: CrearReservaDto,
    @Headers('idempotency-key') headerKey?: string
  ) {
    const dto: CrearReservaDto = {
      ...body,
      idempotencyKey: body.idempotencyKey ?? headerKey,
    };
    return this.reservaService.crear(dto);
  }
}
