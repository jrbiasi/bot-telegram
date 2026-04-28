import { AppDataSource } from '../config/database';
import { Payment } from '../entities/Payment';
import { CreatePaymentDTO, UpdatePaymentDTO } from '../dtos/payment.dto';
import { v4 as uuid } from 'uuid';

export class PaymentService {
  private paymentRepository = AppDataSource.getRepository(Payment);

  async createPayment(data: CreatePaymentDTO): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...data,
      status: 'pending',
      externalPaymentId: `MOCK_${uuid()}`,
    });

    return this.paymentRepository.save(payment);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { id } });
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updatePayment(id: string, data: UpdatePaymentDTO): Promise<Payment | null> {
    await this.paymentRepository.update(id, data);
    return this.getPaymentById(id);
  }

  async mockPayment(paymentId: string): Promise<Payment | null> {
    return this.updatePayment(paymentId, { status: 'completed' });
  }

  async refundPayment(paymentId: string): Promise<Payment | null> {
    return this.updatePayment(paymentId, { status: 'refunded' });
  }
}

export const paymentService = new PaymentService();
