import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reserva, EstadoReserva } from './reserva.entity';
import { CreateReservaDto, UpdateReservaDto } from './reserva.dto';
import { TourService } from '../tour/tour.service';

@Injectable()
export class ReservaService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    private readonly tourService: TourService,
  ) {}

  async create(createReservaDto: CreateReservaDto): Promise<Reserva> {
    // Verificar disponibilidad del tour
    const disponible = await this.tourService.verificarDisponibilidad(
      createReservaDto.tourId,
      createReservaDto.numeroPasajeros
    );

    if (!disponible) {
      throw new BadRequestException('Tour no disponible o cupos insuficientes');
    }

    // Obtener el tour para calcular el monto
    const tour = await this.tourService.findOne(createReservaDto.tourId);
    const montoTotal = Number(tour.precio) * createReservaDto.numeroPasajeros;

    // Crear la reserva
    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      montoTotal,
      estado: EstadoReserva.PENDIENTE,
    });

    const savedReserva = await this.reservaRepository.save(reserva);

    // Reducir cupos del tour
    await this.tourService.reducirCupos(tour.id, createReservaDto.numeroPasajeros);

    return savedReserva;
  }

  async findAll(): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      relations: ['tour'],
      order: { creadoEn: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOne({
      where: { id },
      relations: ['tour'],
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return reserva;
  }

  async findByCliente(email: string): Promise<Reserva[]> {
    return await this.reservaRepository.find({
      where: { emailCliente: email },
      relations: ['tour'],
      order: { creadoEn: 'DESC' },
    });
  }

  async update(id: number, updateReservaDto: UpdateReservaDto): Promise<Reserva> {
    const reserva = await this.findOne(id);
    Object.assign(reserva, updateReservaDto);
    return await this.reservaRepository.save(reserva);
  }

  async confirmar(id: number): Promise<Reserva> {
    const reserva = await this.findOne(id);

    if (reserva.estado === EstadoReserva.CONFIRMADA) {
      throw new BadRequestException('La reserva ya está confirmada');
    }

    if (reserva.estado === EstadoReserva.CANCELADA) {
      throw new BadRequestException('No se puede confirmar una reserva cancelada');
    }

    reserva.estado = EstadoReserva.CONFIRMADA;
    reserva.confirmadoEn = new Date();

    return await this.reservaRepository.save(reserva);
  }

  async cancelar(id: number): Promise<Reserva> {
    const reserva = await this.findOne(id);

    if (reserva.estado === EstadoReserva.CANCELADA) {
      throw new BadRequestException('La reserva ya está cancelada');
    }

    reserva.estado = EstadoReserva.CANCELADA;

    // Devolver cupos al tour
    await this.tourService.aumentarCupos(reserva.tourId, reserva.numeroPasajeros);

    return await this.reservaRepository.save(reserva);
  }

  async delete(id: number): Promise<void> {
    const reserva = await this.findOne(id);
    
    // Si está confirmada o pendiente, devolver cupos
    if (reserva.estado !== EstadoReserva.CANCELADA) {
      await this.tourService.aumentarCupos(reserva.tourId, reserva.numeroPasajeros);
    }

    await this.reservaRepository.remove(reserva);
  }
}
