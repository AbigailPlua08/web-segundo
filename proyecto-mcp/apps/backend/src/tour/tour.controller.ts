import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto, UpdateTourDto } from './tour.dto';

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post()
  async create(@Body() createTourDto: CreateTourDto) {
    return await this.tourService.create(createTourDto);
  }

  @Get()
  async findAll() {
    return await this.tourService.findAll();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return await this.tourService.search(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.tourService.findOne(id);
  }

  @Get(':id/disponibilidad')
  async verificarDisponibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
  ) {
    const disponible = await this.tourService.verificarDisponibilidad(id, cantidad);
    return { disponible, tourId: id, cantidad };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourDto: UpdateTourDto,
  ) {
    return await this.tourService.update(id, updateTourDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.tourService.delete(id);
    return { message: 'Tour eliminado exitosamente' };
  }
}
