import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CrearReservaDto } from '@arquitectura/shared';

@Injectable()
export class ReservaService {
  private readonly logger = new Logger(ReservaService.name);

  constructor(@Inject('RESERVA_CLIENT') private readonly client: ClientProxy) {}

  listar() {
    this.logger.debug('Solicitando listado de reservas');
    return firstValueFrom(this.client.send('reserva.listar', {}));
  }

  async crear(dto: CrearReservaDto) {
    this.logger.debug(
      `Creando reserva para tour ${dto.tourId} con clave ${
        dto.idempotencyKey ?? 'N/A'
      }`
    );
    try {
      return await firstValueFrom(this.client.send('reserva.crear', dto));
    } catch (error) {
      const reason = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al crear reserva', reason.stack);
      throw new RpcException({ message: reason.message });
    }
  }
}
