import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from "typeorm";

@Entity('Contact')
export class Contact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    phoneNumber: string;

    @Column({nullable: true})
    email: string;

    @Column({nullable: true})
    linkedId: number

    @Column({nullable: false})
    linkPrecedence: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date

    @UpdateDateColumn({type: 'timestamp' })
    updatedAt: Date

    @DeleteDateColumn({type: 'timestamp'})
    deletedAt: Date;

}
