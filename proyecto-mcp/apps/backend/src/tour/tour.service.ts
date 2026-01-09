import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tour } from './tour.entity';
import { CreateTourDto, UpdateTourDto } from './tour.dto';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
  ) {}

  async create(createTourDto: CreateTourDto): Promise<Tour> {
    const tour = this.tourRepository.create({
      ...createTourDto,
      cuposDisponibles: createTourDto.cuposTotales,
    });
    return await this.tourRepository.save(tour);
  }

  async findAll(): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: { activo: true },
      order: { fechaSalida: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Tour> {
    const tour = await this.tourRepository.findOne({ where: { id } });
    if (!tour) {
      throw new NotFoundException(`Tour con ID ${id} no encontrado`);
    }
    return tour;
  }

  async search(query: string): Promise<Tour[]> {
    return await this.tourRepository.find({
      where: [
        { nombre: Like(`%${query}%`), activo: true },
        { destino: Like(`%${query}%`), activo: true },
      ],
      order: { fechaSalida: 'ASC' },
    });
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<Tour> {
    const tour = await this.findOne(id);
    Object.assign(tour, updateTourDto);
    return await this.tourRepository.save(tour);
  }

  async reducirCupos(id: number, cantidad: number): Promise<Tour> {
    const tour = await this.findOne(id);
    
    if (tour.cuposDisponibles < cantidad) {
      throw new BadRequestException(
        `Cupos insuficientes. Disponibles: ${tour.cuposDisponibles}, Solicitados: ${cantidad}`
      );
    }

    tour.cuposDisponibles -= cantidad;
    return await this.tourRepository.save(tour);
  }

  async aumentarCupos(id: number, cantidad: number): Promise<Tour> {
    const tour = await this.findOne(id);
    tour.cuposDisponibles += cantidad;
    
    // No permitir que exceda el total
    if (tour.cuposDisponibles > tour.cuposTotales) {
      tour.cuposDisponibles = tour.cuposTotales;
    }
    
    return await this.tourRepository.save(tour);
  }

  async verificarDisponibilidad(id: number, cantidad: number): Promise<boolean> {
    const tour = await this.findOne(id);
    return tour.activo && tour.cuposDisponibles >= cantidad;
  }

  async delete(id: number): Promise<void> {
    const tour = await this.findOne(id);
    tour.activo = false;
    await this.tourRepository.save(tour);
  }
}
