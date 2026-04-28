import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { SubscriptionDTO } from '../dtos/payment.dto';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

export class SubscriptionService {
  private subscriptionRepository = AppDataSource.getRepository(Subscription);

  async createSubscription(data: SubscriptionDTO): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...data,
      status: 'active',
      externalSubscriptionId: `SUB_${uuid()}`,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'plan'],
    });
  }

  async getUserActiveSubscription(userId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { userId, status: 'active' },
      relations: ['plan'],
    });
  }

  async getUserSubscriptions(userId: number): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription | null> {
    await this.subscriptionRepository.update(subscriptionId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    return this.getSubscriptionById(subscriptionId);
  }

  async renewSubscription(planId: string, userId: number): Promise<Subscription> {
    const plan = (await AppDataSource.getRepository('Plan').findOne({
      where: { id: planId },
    })) as any;

    if (!plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date();
    let endDate: Date;

    switch (plan.billingCycle) {
      case 'monthly':
        endDate = dayjs(startDate).add(1, 'month').toDate();
        break;
      case 'yearly':
        endDate = dayjs(startDate).add(1, 'year').toDate();
        break;
      case 'lifetime':
        endDate = dayjs(startDate).add(100, 'years').toDate();
        break;
      default:
        endDate = dayjs(startDate).add(1, 'month').toDate();
    }

    return this.createSubscription({
      userId,
      planId,
      startDate,
      endDate,
    });
  }
}

export const subscriptionService = new SubscriptionService();
