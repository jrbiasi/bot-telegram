import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Plan } from './Plan';
import { Payment } from './Payment';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint')
  userId: number;

  @Column('uuid')
  planId: string;

  @Column({
    type: 'enum',
    enum: ['active', 'cancelled', 'expired', 'pending'],
    default: 'pending',
  })
  status: 'active' | 'cancelled' | 'expired' | 'pending';

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  externalSubscriptionId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];
}
