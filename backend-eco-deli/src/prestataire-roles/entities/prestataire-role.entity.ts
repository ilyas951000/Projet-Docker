import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { PrestataireRequirement } from 'src/prestataire-requirements/entities/prestataire-requirement.entity';

@Entity()
export class PrestataireRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => PrestataireRequirement, (req) => req.role)
  requirements: PrestataireRequirement[];

  @OneToMany(() => User, (user) => user.prestataireRole)
  users: User[];
}
