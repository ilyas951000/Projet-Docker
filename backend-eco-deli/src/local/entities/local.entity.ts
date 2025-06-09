import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Box } from '../../box/entities/box.entity';




@Entity('locals')
export class Local {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 6 })
  longitude: number;

  @Column()
  capacity: number;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => Box, (box: Box) => box.local)
  boxes: Box[];
}