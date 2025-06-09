import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Virement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'providerId' }) // <<< très important
  provider: User;

  @Column()
  providerId: number;


  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  stripePayoutId: string;

  @Column({ default: 'en_attente' }) // 👈 Ajout de cette ligne
  status: 'en_attente' | 'accepte' | 'refuse';

  @CreateDateColumn()
  createdAt: Date;
}
