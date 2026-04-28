export interface CreatePlanDTO {
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  features?: string;
}

export interface UpdatePlanDTO {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly' | 'lifetime';
  features?: string;
  isActive?: boolean;
}

export interface PlanResponseDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'lifetime';
  features?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
