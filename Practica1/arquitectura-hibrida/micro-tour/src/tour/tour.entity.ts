import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'tours' })
export class TourEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nombre!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column()
  duracion!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ name: 'guia_id' })
  guiaId!: string;

  @Column({ name: 'destino_id' })
  destinoId!: string;

  @Column({ name: 'capacidad_maxima', type: 'int' })
  capacidadMaxima!: number;

  @Column({ name: 'capacidad_disponible', type: 'int', default: () => '0' })
  capacidadDisponible!: number;

  @Column({ default: true })
  disponible!: boolean;

  @Column({ name: 'imagen_url', nullable: true })
  imagenUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
