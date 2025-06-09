// src/messages/entities/message.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromUserId: number;

  @Column()
  toUserId: number;

  @Column()
  content: string;

  @Column({ nullable: true }) // 👈 ici
  packageId?: number;

  @CreateDateColumn()
  timestamp: Date;
}
