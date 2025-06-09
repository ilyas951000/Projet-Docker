import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Movement {
  @PrimaryGeneratedColumn()
  id: number;

  /** Référence à l'utilisateur (livreur) */
  @Column()
  userId: number;

  // === ORIGINE ===

  @Column()
  originStreet: string;

  @Column()
  originCity: string;

  @Column()
  originPostalCode: number;

  @Column('float', { nullable: true })
  originLatitude: number;

  @Column('float', { nullable: true })
  originLongitude: number;

  // === DESTINATION ===

  @Column()
  destinationStreet: string;

  @Column()
  destinationCity: string;

  @Column()
  destinationPostalCode: number;

  @Column('float', { nullable: true })
  destinationLatitude: number;

  @Column('float', { nullable: true })
  destinationLongitude: number;

  /** Si le mouvement est actif ou non */
  @Column({ default: true })
  active: boolean;

  /** Note optionnelle */
  @Column({ type: 'text', nullable: true })
  note?: string;

  /** Date prévue du trajet */
  @Column({ type: 'date', nullable: true })
  availableOn?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
