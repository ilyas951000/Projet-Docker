import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Advertisement } from 'src/advertisements/entities/advertisement.entity';
import { Localisation } from 'src/localisation/entities/localisation.entity';
import { User } from 'src/users/entities/user.entity';
import { TransferHistory } from 'src/transfer-history/entities/transfer-history.entity';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  packageName?: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  packageWeight?: number;

  @Column({ nullable: true })
  packageQuantity?: number;

  @Column({ nullable: true })
  isPaid?: boolean;

  @Column({ default: false })
  prioritaire: boolean;

  @Column({ nullable: true })
  packageDimension?: string;

  @Column({ nullable: true, default: 'en attente' })
  deliveryStatus?: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'deliverPackage',
    joinColumn: { name: 'packageId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToOne(() => Advertisement, ad => ad.packages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'advertisementId' })
  advertisement?: Advertisement;

  @Column({ nullable: true })
  advertisementId?: number;

  @OneToMany(() => Localisation, loc => loc.package, { cascade: true })
  localisations: Localisation[];

  @OneToMany(() => TransferHistory, (transfer) => transfer.package)
  transferHistories: TransferHistory[];


  toJSON() {
    const { advertisement, ...rest } = this;
    return rest;
  }
}
