import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Local } from 'src/local/entities/local.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';


@Entity('boxes')
export class Box {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  size: 'small' | 'medium' | 'large';

  @Column({ default: 'available' })
  status: 'available' | 'reserved' | 'occupied';

  @ManyToOne(() => Local, (local) => local.boxes)
  @JoinColumn()
  local: Local;

  @OneToMany(() => Reservation, (reservation: Reservation) => reservation.box, { eager: true })
  reservations: Reservation[];
}