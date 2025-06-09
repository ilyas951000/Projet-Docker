
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('livreur_requirement')
export class LivreurRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
