import { IsString, IsNumber, IsEmail, IsNotEmpty, Min, IsEnum, IsOptional } from 'class-validator';
import { EstadoReserva } from './reserva.entity';

export class CreateReservaDto {
  @IsNotEmpty()
  @IsNumber()
  tourId: number;

  @IsNotEmpty()
  @IsString()
  nombreCliente: string;

  @IsNotEmpty()
  @IsEmail()
  emailCliente: string;

  @IsNotEmpty()
  @IsString()
  telefonoCliente: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  numeroPasajeros: number;
}

export class UpdateReservaDto {
  @IsOptional()
  @IsEnum(EstadoReserva)
  estado?: EstadoReserva;

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroPasajeros?: number;
}
