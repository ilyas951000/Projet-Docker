// src/public-profile/public-profile.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PublicProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prestationType: string;

  @Column('decimal')
  price: number;

  @Column('text')
  description: string;

  // NOUVEAU
  @Column({ nullable: true })
  zoneIntervention: string;

  @Column({ type: 'text', nullable: true })
  disponibilites: string;

  @Column({ type: 'text', nullable: true })
  biographie: string;

  @Column({ nullable: true })
  langues: string; // stocke une liste séparée par des virgules

  @Column({ nullable: true })
  delaiReponse: string; // ex: "24h", "2h"

  @Column({ nullable: true })
  tempsMoyenIntervention: string; // ex: "1h30"

  @ManyToOne(() => User)
  user: User;
}