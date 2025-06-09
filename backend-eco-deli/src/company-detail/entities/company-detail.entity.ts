import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CompanyDetail {    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    companyName: string;

    @Column()
    legalStructure: string; //AS SAS SARL etc..

    @Column()
    siren: string;



    @Column()
    dateOfIncorporation: Date;

    
    @Column()
    registeredOfficeAddressStreet: string;
    @Column()
    registeredOfficeAddressCity: string;
    @Column()
    registeredOfficeAddressPostalCode: string;


    @Column()
    startDateOfActivity: Date;


    @Column()
    currentYear: string;

    @Column({ nullable: true })
    usersId: number;

    @ManyToOne(() => User, (user) => user.companyDetail, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'usersId' }) 
    user: User; 

}
