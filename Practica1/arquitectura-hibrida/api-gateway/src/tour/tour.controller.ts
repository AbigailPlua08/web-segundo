import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ActualizarTourDto } from '@arquitectura/shared';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { TourService } from './tour.service';

class CrearTourDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  duracion!: string;

  @IsPositive()
  precio!: number;

  @IsString()
  @IsNotEmpty()
  guiaId!: string;

  @IsString()
  @IsNotEmpty()
  destinoId!: string;

  @IsInt()
  @IsPositive()
  capacidadMaxima!: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsUrl()
  imagenUrl?: string;
}

class ActualizarDisponibilidadBody {
  @IsOptional()
  @IsInt()
  @IsPositive()
  capacidadDisponible?: number;

  @IsOptional()
  @IsInt()
  deltaCapacidad?: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Get()
  listar() {
    return this.tourService.listar();
  }

  @Post()
  crear(@Body() dto: CrearTourDto) {
    return this.tourService.crear(dto as unknown as Record<string, unknown>);
  }

  @Patch(':tourId/disponibilidad')
  actualizarDisponibilidad(
    @Param('tourId') tourId: string,
    @Body() body: ActualizarDisponibilidadBody
  ) {
    const dto: ActualizarTourDto = {
      tourId,
      capacidadDisponible: body.capacidadDisponible,
      deltaCapacidad: body.deltaCapacidad,
      disponible: body.disponible,
    };
    return this.tourService.actualizarDisponibilidad(dto);
  }
}
