import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { CreateReservaDto, UpdateReservaDto } from './reserva.dto';

@Controller('reservas')
export class ReservaController {
  constructor(private readonly reservaService: ReservaService) {}

  @Post()
  async create(@Body() createReservaDto: CreateReservaDto) {
    return await this.reservaService.create(createReservaDto);
  }

  @Get()
  async findAll(@Query('email') email?: string) {
    if (email) {
      return await this.reservaService.findByCliente(email);
    }
    return await this.reservaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.reservaService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return await this.reservaService.update(id, updateReservaDto);
  }

  @Post(':id/confirmar')
  async confirmar(@Param('id', ParseIntPipe) id: number) {
    return await this.reservaService.confirmar(id);
  }

  @Post(':id/cancelar')
  async cancelar(@Param('id', ParseIntPipe) id: number) {
    return await this.reservaService.cancelar(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.reservaService.delete(id);
    return { message: 'Reserva eliminada exitosamente' };
  }
}
