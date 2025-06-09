// src/payments/entities/transaction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  client: User;

  @ManyToOne(() => User)
  provider: User;

  @Column()
  amount: number;

  @Column()
  platformFee: number;

  @Column()
  currency: string;

  @Column()
  stripePaymentIntentId: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}