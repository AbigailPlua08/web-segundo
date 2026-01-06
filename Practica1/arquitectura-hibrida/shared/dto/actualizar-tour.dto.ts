import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class ActualizarTourDto {
  @IsString()
  @IsNotEmpty()
  tourId!: string;

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
