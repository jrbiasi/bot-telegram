import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

import { Subscription } from './Subscription';
import { User } from './User';

@Entity('payments')
export class Payment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column('bigint')
	userId: number;

	@Column('uuid')
	subscriptionId: string;

	@Column('decimal', { precision: 10, scale: 2 })
	amount: number;

	@Column()
	currency: string;

	@Column({
		type: 'enum',
		enum: ['pending', 'completed', 'failed', 'refunded'],
		default: 'pending',
	})
	status: 'pending' | 'completed' | 'failed' | 'refunded';

	@Column({ nullable: true })
	externalPaymentId?: string;

	@Column({ nullable: true })
	paymentMethod?: string;

	@Column({ nullable: true })
	description?: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => User, (user) => user.payments)
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Subscription, (sub) => sub.payments)
	@JoinColumn({ name: 'subscriptionId' })
	subscription: Subscription;
}
