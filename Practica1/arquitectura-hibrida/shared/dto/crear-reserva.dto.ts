import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearReservaDto {
  @IsString()
  @IsNotEmpty()
  tourId!: string;

  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsISO8601()
  fechaReserva!: string;

  @IsInt()
  @Min(1)
  @Max(999)
  cantidadPersonas!: number;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
