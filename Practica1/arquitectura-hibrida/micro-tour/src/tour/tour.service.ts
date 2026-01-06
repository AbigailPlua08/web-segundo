import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { ActualizarTourDto, MensajeEvento } from '@arquitectura/shared';
import { TourRepository } from './tour.repository';

@Injectable()
export class TourService implements OnModuleDestroy {
  private readonly logger = new Logger(TourService.name);
  private readonly eventsClient: ClientProxy;

  constructor(
    private readonly repository: TourRepository,
    config: ConfigService
  ) {
    const url = config.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672'
    );
    const exchange = config.get<string>(
      'RABBITMQ_EVENTS_EXCHANGE',
      'tour.events.exchange'
    );

    this.eventsClient = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url],
        queue: exchange,
        queueOptions: { durable: true },
      },
    });
  }

  onModuleDestroy() {
    void this.eventsClient.close();
  }

  listar() {
    return this.repository.findAll();
  }

  async crear(payload: any) {
    const capacidadMaxima = Number(payload.capacidadMaxima);
    if (!Number.isFinite(capacidadMaxima) || capacidadMaxima <= 0) {
      throw new BadRequestException(
        'capacidadMaxima debe ser un entero positivo'
      );
    }

    const entity = await this.repository.createTour({
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      duracion: payload.duracion,
      precio: Number(payload.precio),
      guiaId: payload.guiaId,
      destinoId: payload.destinoId,
      capacidadMaxima,
      capacidadDisponible: capacidadMaxima,
      disponible: payload.disponible ?? true,
      imagenUrl: payload.imagenUrl,
    });

    this.emitEvent('tour.creado', {
      tourId: entity.id,
      capacidadDisponible: entity.capacidadDisponible,
    });
    return entity;
  }

  async actualizarDisponibilidad(dto: ActualizarTourDto) {
    const { tourId, capacidadDisponible, deltaCapacidad, disponible } = dto;

    if (typeof capacidadDisponible === 'number' && capacidadDisponible < 0) {
      throw new BadRequestException(
        'capacidadDisponible no puede ser negativa'
      );
    }

    if (typeof deltaCapacidad === 'number' && deltaCapacidad === 0) {
      throw new BadRequestException('deltaCapacidad no puede ser cero');
    }

    let updated;

    try {
      updated = await this.repository.updateAvailabilityWithDelta(
        tourId,
        capacidadDisponible,
        deltaCapacidad,
        disponible
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la disponibilidad del tour'
      );
    }

    if (!updated) {
      throw new BadRequestException(`Tour ${tourId} no encontrado`);
    }

    this.emitEvent('tour.disponibilidad_actualizada', {
      tourId: updated.id,
      capacidadDisponible: updated.capacidadDisponible,
      disponible: updated.disponible,
    });

    return updated;
  }

  private emitEvent<T>(tipo: string, payload: T) {
    const evento: MensajeEvento<T> = {
      id: randomUUID(),
      tipo,
      fecha: new Date().toISOString(),
      payload,
    };

    this.logger.debug(`Emitiendo evento ${tipo}`);
    this.eventsClient.emit(tipo, evento);
  }
}
