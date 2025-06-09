import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Package } from 'src/packages/entities/package.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class TransferHistory {
  @PrimaryGeneratedColumn()
  id: number;

  // === Relations ===

  @ManyToOne(() => Package, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'packageId' })
  package: Package;

  @Column()
  packageId: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'fromCourierId' })
  fromCourier: User;

  @Column()
  fromCourierId: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'toCourierId' })
  toCourier: User;

  @Column()
  toCourierId: number;

  // === Infos de transfert ===

  @Column()
  address: string;

  @Column()
  postalCode: string;

  @Column()
  city: string;

  @Column()
  transferCode: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @CreateDateColumn()
  transferDate: Date;

  @Column('float', { nullable: true })
  livreur1Progress: number; // pourcentage effectué par le livreur 1 (fromCourier)

  @Column('float', { nullable: true })
  livreur2Progress: number; // pourcentage restant pour le livreur 2 (toCourier)

}

