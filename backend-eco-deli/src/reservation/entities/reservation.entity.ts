import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Box } from 'src/box/entities/box.entity';
import { User } from 'src/users/entities/user.entity';
import { Package } from 'src/packages/entities/package.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Box, (box) => box.reservations)
  @JoinColumn()
  box: Box;

  @ManyToOne(() => User)
  @JoinColumn()
  client: User;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @ManyToOne(() => Package, { nullable: true })
  @JoinColumn({ name: 'packageId' })
  package?: Package;

  @Column({ nullable: true })
  packageId?: number;
}
