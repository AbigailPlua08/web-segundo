import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ActualizarTourDto,
  CrearReservaDto,
  MensajeEvento,
} from '@arquitectura/shared';
import { ReservaRepository } from './reserva.repository';
import { ReservaEntity } from './reserva.entity';
import { randomUUID } from 'crypto';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class ReservaService implements OnModuleDestroy {
  private readonly logger = new Logger(ReservaService.name);
  private readonly tourClient: ClientProxy;

  constructor(
    private readonly repository: ReservaRepository,
    config: ConfigService
  ) {
    const url = config.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672'
    );
    const tourQueue = config.get<string>(
      'RABBITMQ_TOUR_QUEUE',
      'tour.command.queue'
    );

    this.tourClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: tourQueue,
        queueOptions: { durable: true },
      },
    });
  }

  onModuleDestroy() {
    void this.tourClient.close();
  }

  listar() {
    return this.repository.findAll();
  }

  async crear(dto: CrearReservaDto) {
    let reserva: ReservaEntity | null = null;

    try {
      const resultadoPersistencia = await this.persistirReserva(dto);
      reserva = resultadoPersistencia.reserva;

      if (!resultadoPersistencia.esNueva) {
        this.logger.debug(
          `Reserva con clave ${dto.idempotencyKey} ya existía, se reutiliza resultado.`
        );
        return { reserva, disponibilidad: null };
      }

      const disponibilidad = await this.actualizarTour(dto);
      const reservaConfirmada = await this.repository.actualizarEstado(
        reserva.id,
        'confirmada'
      );
      return { reserva: reservaConfirmada, disponibilidad };
    } catch (error) {
      if (reserva?.id) {
        await this.repository.actualizarEstado(reserva.id, 'cancelada');
      }
      const reason = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al crear reserva', reason.stack);
      throw new RpcException({ message: reason.message });
    }
  }

  private async persistirReserva(dto: CrearReservaDto) {
    const existente = await this.repository.findByIdempotency(
      dto.idempotencyKey!
    );
    if (existente) {
      return { reserva: existente, esNueva: false };
    }

    const fechaReserva = this.obtenerFechaReserva(dto.fechaReserva);
    try {
      const reserva = await this.repository.createReserva({
        tourId: dto.tourId,
        usuarioId: dto.usuarioId,
        fechaReserva,
        cantidadPersonas: dto.cantidadPersonas,
        estado: 'pendiente',
        total: 0,
        idempotencyKey: dto.idempotencyKey!,
      });
      return { reserva, esNueva: true };
    } catch (error) {
      if (this.esErrorLlaveDuplicada(error)) {
        const existenteDespues = await this.repository.findByIdempotency(
          dto.idempotencyKey!
        );
        if (existenteDespues) {
          return { reserva: existenteDespues, esNueva: false };
        }
      }
      throw error;
    }
  }

  private async actualizarTour(dto: CrearReservaDto) {
    const payload: ActualizarTourDto = {
      tourId: dto.tourId,
      deltaCapacidad: -dto.cantidadPersonas,
    };

    const response = await firstValueFrom(
      this.tourClient.send('tour.actualizar', payload)
    );
    this.emitEventoReserva(dto, response?.id ?? dto.tourId);
    return response;
  }

  private emitEventoReserva(dto: CrearReservaDto, tourId: string) {
    const evento: MensajeEvento = {
      id: randomUUID(),
      tipo: 'reserva.creada',
      fecha: new Date().toISOString(),
      payload: {
        tourId,
        usuarioId: dto.usuarioId,
        cantidadPersonas: dto.cantidadPersonas,
      },
    };

    this.logger.debug(`Reserva emitida ${evento.id}`);
  }

  private obtenerFechaReserva(fecha?: string) {
    if (!fecha) {
      return new Date();
    }

    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) {
      this.logger.warn(
        `Fecha de reserva inválida (${fecha}). Se utilizará la hora actual.`
      );
      return new Date();
    }

    return parsed;
  }

  private esErrorLlaveDuplicada(error: unknown) {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string } | undefined;
      const code =
        driverError?.code ?? (error as unknown as { code?: string })?.code;
      return code === '23505';
    }
    return false;
  }
}
