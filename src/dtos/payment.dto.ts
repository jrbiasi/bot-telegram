export interface CreatePaymentDTO {
  userId: number;
  subscriptionId: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  description?: string;
}

export interface UpdatePaymentDTO {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  externalPaymentId?: string;
}

export interface PaymentResponseDTO {
  id: string;
  userId: number;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  externalPaymentId?: string;
  paymentMethod?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionDTO {
  userId: number;
  planId: string;
  startDate: Date;
  endDate: Date;
}
