import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { InvoiceItem } from "./invoice-item.entity";
import { User } from "src/users/entities/user.entity";

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  invoiceNumber: string;

  @Column()
  issueDate: Date;

  @Column()
  paymentDate: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: string;

  @Column()
  paymentStatus: boolean;

  @Column()
  paymentMethod: string;

  @Column()
  serviceTitle: string;

  @Column()
  userType: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, { eager: true }) // ⚠️ 'eager' => récupère automatiquement l'utilisateur
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
