// ===========================
// src/documents/entities/document.entity.ts
// ===========================
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('document')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: "rien" })
  documentType: string;

  @Column({ type: 'date' })
  documentDate: Date;

  @Column()
  format: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column()
  fileName: string;

  @Column({ type: 'int', default: new Date().getFullYear() })
  targetYear: number;


  @Column({ default: "undetermined" })
  documentValid: string;

  @Column()
  filePath: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  requirementId: number;
}
