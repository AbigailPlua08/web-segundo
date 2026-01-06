import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservaEntity, EstadoReserva } from './reserva.entity';

@Injectable()
export class ReservaRepository {
  constructor(
    @InjectRepository(ReservaEntity)
    private readonly repository: Repository<ReservaEntity>
  ) {}

  findAll() {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findByIdempotency(idempotencyKey: string) {
    return this.repository.findOne({ where: { idempotencyKey } });
  }

  async createReserva(payload: Partial<ReservaEntity>) {
    const entity = this.repository.create(payload);
    return this.repository.save(entity);
  }

  async actualizarEstado(id: string, estado: EstadoReserva) {
    await this.repository.update({ id }, { estado });
    return this.repository.findOne({ where: { id } });
  }
}
