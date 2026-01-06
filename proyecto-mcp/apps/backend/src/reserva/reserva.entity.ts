import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Tour } from '../tour/tour.entity';

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA'
}

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombreCliente: string;

  @Column({ length: 100 })
  emailCliente: string;

  @Column({ length: 20 })
  telefonoCliente: string;

  @Column('int')
  numeroPasajeros: number;

  @Column({
    type: 'text',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE
  })
  estado: EstadoReserva;

  @Column('decimal', { precision: 10, scale: 2 })
  montoTotal: number;

  @ManyToOne(() => Tour, (tour) => tour.reservas)
  @JoinColumn({ name: 'tourId' })
  tour: Tour;

  @Column()
  tourId: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;

  @Column({ type: 'datetime', nullable: true })
  confirmadoEn: Date;
}
