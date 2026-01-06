import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reserva } from '../reserva/reserva.entity';

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  nombre: string;

  @Column({ length: 100 })
  destino: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  @Column('int')
  cuposDisponibles: number;

  @Column('int')
  cuposTotales: number;

  @Column('date')
  fechaSalida: Date;

  @Column('date')
  fechaRetorno: Date;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Reserva, (reserva) => reserva.tour)
  reservas: Reserva[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  creadoEn: Date;
}
