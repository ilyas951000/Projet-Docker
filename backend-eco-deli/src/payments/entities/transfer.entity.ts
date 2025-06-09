import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Transfer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  provider: User;

  @ManyToOne(() => User, { eager: true })
  client: User;

  @Column('int')
  amount: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed' | 'paid';

  @Column({ default: false })
  isValidatedByClient: boolean;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'int', nullable: true })
  packageId: number | null;


}
