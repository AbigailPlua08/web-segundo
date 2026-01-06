import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type EstadoReserva =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada';

@Entity({ name: 'reservas' })
export class ReservaEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tour_id' })
  tourId!: string;

  @Column({ name: 'usuario_id' })
  usuarioId!: string;

  @Column({
    name: 'fecha_reserva',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaReserva!: Date;

  @Column({ name: 'cantidad_personas', type: 'int' })
  cantidadPersonas!: number;

  @Column({ type: 'varchar', length: 20 })
  estado!: EstadoReserva;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
