import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './Subscription';
import { Payment } from './Payment';

@Entity('users')
export class User {
  @PrimaryColumn('bigint')
  telegramId: number;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: false })
  isBot: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions: Subscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
