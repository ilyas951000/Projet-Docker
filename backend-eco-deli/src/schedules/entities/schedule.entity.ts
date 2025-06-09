// src/schedule/entities/schedule.entity.ts
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    scheduleStart: Date;
    
    @Column()
    scheduleEnd: Date;

    @Column()
    scheduleStatus: string;

    @Column()
    scheduleDescription: string;

    @ManyToMany(() => User, { eager: true })
    @JoinTable({ name: "courierSchedule" })
    user: User[];

}
