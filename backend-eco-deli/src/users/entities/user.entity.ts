import { Advertisement } from "src/advertisements/entities/advertisement.entity";
import { Invoice } from "src/invoices/entities/invoice.entity";
import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Document } from "src/documents/entities/document.entity";
import { CompanyDetail } from "src/company-detail/entities/company-detail.entity";
import { ContractElement } from "src/contract-element/entities/contract-element.entity";
import { PrestataireRole } from 'src/prestataire-roles/entities/prestataire-role.entity';

@Entity('user')  // Utilisation explicite du nom de la table
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userLastName: string;

  @Column()
  userFirstName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  userRole: string;

  @Column({ default: 'client' })
  userStatus: string;

  @Column()
  userAddress: string;



  @Column({ default: false })
  hasAccount: boolean;

  @Column({ type: 'int', default: 0 }) // 0 = Free, 1 = Starter, 2 = Premium
  userSubscription: number;


  @Column({ default: false })
  occasionalCourier: boolean;

  @Column({ default: false })
  valid: boolean;



  @ManyToOne(() => PrestataireRole, (role) => role.users, { nullable: true })
  @JoinColumn()
  prestataireRole: PrestataireRole;
  
  @RelationId((user: User) => user.prestataireRole)
  prestataireRoleId: number;


  @Column({ nullable: true })
  stripeAccountId?: string;

  @OneToMany(() => Subscription, (subscription) => subscription.users)
  subscription: Subscription[];

  @OneToMany(() => Advertisement, (advertisement) => advertisement.users)
  advertisements: Advertisement[];

  @OneToOne(() => Document, { nullable: true, eager: true, cascade: true })
  @JoinColumn()
  justificationDocument: Document | null;

  @OneToMany(() => CompanyDetail, (advertisement) => advertisement.user)
  companyDetail: CompanyDetail[]; 
}
