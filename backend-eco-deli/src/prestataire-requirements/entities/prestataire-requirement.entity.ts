// prestataire-requirement.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { PrestataireRole } from 'src/prestataire-roles/entities/prestataire-role.entity';

@Entity('prestataire_requirement')
export class PrestataireRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => PrestataireRole, (role) => role.requirements, { onDelete: 'CASCADE' })
  role: PrestataireRole;

  @RelationId((requirement: PrestataireRequirement) => requirement.role)
  roleId: number;
}
