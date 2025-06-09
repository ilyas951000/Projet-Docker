import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm'
import { Package } from '../../packages/entities/package.entity' // adapte le chemin si besoin

@Entity()
export class PlatformFee {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  packageId: number

  @Column('float')
  amount: number

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => Package)
  package: Package
}
