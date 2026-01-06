import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ActualizarTourDto } from '@arquitectura/shared';

@Injectable()
export class TourService {
  private readonly logger = new Logger(TourService.name);

  constructor(@Inject('TOUR_CLIENT') private readonly client: ClientProxy) {}

  listar() {
    this.logger.debug('Solicitando listado de tours');
    return firstValueFrom(this.client.send('tour.listar', {}));
  }

  async crear(payload: Record<string, unknown>) {
    this.logger.debug(`Creando tour ${payload?.['nombre']}`);
    try {
      return await firstValueFrom(this.client.send('tour.crear', payload));
    } catch (error) {
      const reason = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al crear tour', reason.stack);
      throw new RpcException({ message: reason.message });
    }
  }

  async actualizarDisponibilidad(dto: ActualizarTourDto) {
    this.logger.debug(`Actualizando disponibilidad de tour ${dto.tourId}`);
    try {
      return await firstValueFrom(this.client.send('tour.actualizar', dto));
    } catch (error) {
      const reason = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al actualizar disponibilidad', reason.stack);
      throw new RpcException({ message: reason.message });
    }
  }
}
