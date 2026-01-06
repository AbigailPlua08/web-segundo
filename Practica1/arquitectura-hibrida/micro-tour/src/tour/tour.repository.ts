import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourEntity } from './tour.entity';

@Injectable()
export class TourRepository {
  constructor(
    @InjectRepository(TourEntity)
    private readonly repository: Repository<TourEntity>
  ) {}

  findAll() {
    return this.repository.find();
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  async createTour(payload: Partial<TourEntity>) {
    const entity = this.repository.create({
      ...payload,
      capacidadDisponible:
        payload.capacidadDisponible ?? payload.capacidadMaxima ?? 0,
    });
    return this.repository.save(entity);
  }

  async updateAvailabilityWithDelta(
    id: string,
    capacidadDisponible?: number,
    deltaCapacidad?: number,
    disponible?: boolean
  ) {
    const current = await this.findById(id);
    if (!current) {
      return null;
    }

    let nuevaCapacidad = current.capacidadDisponible;

    if (typeof deltaCapacidad === 'number') {
      nuevaCapacidad = nuevaCapacidad + deltaCapacidad;
    }

    if (typeof capacidadDisponible === 'number') {
      nuevaCapacidad = capacidadDisponible;
    }

    if (nuevaCapacidad < 0) {
      throw new Error('La capacidad disponible no puede ser negativa');
    }

    const updatePayload: Partial<TourEntity> = {
      capacidadDisponible: nuevaCapacidad,
    };

    if (typeof disponible === 'boolean') {
      updatePayload.disponible = disponible;
    }

    await this.repository.update({ id }, updatePayload);
    return this.findById(id);
  }
}
