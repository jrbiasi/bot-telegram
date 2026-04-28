import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { Subscription } from './Subscription';

@Entity('plans')
export class Plan {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column('decimal', { precision: 10, scale: 2 })
	price: number;

	@Column()
	currency: string;

	@Column()
	billingCycle: 'monthly' | 'yearly' | 'lifetime';

	@Column({ nullable: true })
	features?: string;

	@Column({ default: true })
	isActive: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => Subscription, (sub) => sub.plan)
	subscriptions: Subscription[];
}
