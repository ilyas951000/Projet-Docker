import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Transfer } from 'src/payments/entities/transfer.entity';
import { User } from 'src/users/entities/user.entity'; // ✅ import nécessaire

@Entity()
export class Intervention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestataireId: number;

  @ManyToOne(() => User, { eager: true }) // ✅ relation vers le prestataire
  @JoinColumn({ name: 'prestataireId' })
  prestataire: User;

  @Column({ nullable: true })
  clientId?: number;

  @ManyToOne(() => User, { eager: true, nullable: true }) // ✅ relation vers le client
  @JoinColumn({ name: 'clientId' })
  client?: User;

  @Column()
  type: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ default: 'en_attente' })
  statut: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  prix: number;

  @Column({ type: 'text', nullable: true })
  commentaireClient?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Transfer, { eager: true, nullable: true })
  @JoinColumn()
  transfer?: Transfer;
}
