import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ContractElement {    
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    titre: string;

    @Column("text", { nullable: true })
    contenu: string;

    @ManyToMany(() => User, (user) => user.companyDetail)
    @JoinTable({
    name: 'contractMerchant',
    joinColumn: {
      name: 'contractElementId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'usersId',
      referencedColumnName: 'id',
        },
    })
    users: User[];

}
