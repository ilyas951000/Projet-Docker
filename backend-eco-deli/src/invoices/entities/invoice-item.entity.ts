import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Invoice } from "./invoice.entity";

@Entity()
export class InvoiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: string;

  @Column({ type: "enum", enum: ["livraison", "prestation", "abonnement", "autre"] })
  type: "livraison" | "prestation" | "abonnement" | "autre";

  @Column({ nullable: true })
  referenceId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
  invoice: Invoice;
}
