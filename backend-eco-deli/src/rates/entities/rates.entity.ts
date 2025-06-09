import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Rates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  // On ne définit pas l'inverse afin d'éviter de référencer des propriétés absentes dans User
  @ManyToOne(() => User, { eager: true })
  client: User;

  @ManyToOne(() => User, { eager: true })
  provider: User;

  @CreateDateColumn()
  createdAt: Date;
}