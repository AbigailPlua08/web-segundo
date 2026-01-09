import { IsString, IsNumber, IsDate, IsBoolean, Min, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTourDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  destino: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  cuposTotales: number;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaSalida: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  fechaRetorno: Date;
}

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cuposDisponibles?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
