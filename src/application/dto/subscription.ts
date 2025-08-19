// サブスクリプション関連のDTO

export interface SubscriptionDTO {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate: Date;
  subscribedAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionDTO {
  userId: string;
  userEmail: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate?: Date;
}

export interface UpdateSubscriptionDTO {
  id: string;
  userId: string;
  name?: string;
  price?: number;
  currency?: string;
  paymentCycle?: string;
  category?: string;
  paymentStartDate?: Date;
}

export interface DeleteSubscriptionDTO {
  subscriptionId: string;
  userId: string;
}

export interface GetSubscriptionsDTO {
  userId: string;
}

export interface SubscriptionResponseDTO {
  subscriptions: SubscriptionDTO[];
}

export interface SubscriptionStatsDTO {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  categoryBreakdown: Record<string, number>;
  currencyBreakdown: Record<string, number>;
}
