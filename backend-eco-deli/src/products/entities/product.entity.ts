import { Subscription } from "src/subscriptions/entities/subscription.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    productName: string;
    
    @Column("decimal", {precision:10, scale:2})
    productWeight: number;

    @Column()
    productDimensions: string;

    @Column("decimal", {precision:10, scale:2})
    productPrice: number;

    @Column()
    productCategory: string;

    @OneToOne(() => Subscription)
    @JoinColumn()
    subscription: Subscription
}
