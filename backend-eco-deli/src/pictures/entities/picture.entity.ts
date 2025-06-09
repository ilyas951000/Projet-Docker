import { Advertisement } from "src/advertisements/entities/advertisement.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('picture') 
export class Picture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;
    
    @ManyToOne(() => Advertisement, (advertisement) => advertisement.picture, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'advertisementId' }) 
    advertisement: Advertisement; 
}
