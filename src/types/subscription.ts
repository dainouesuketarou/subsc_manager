import { BaseEntity } from './common';

// サブスクリプション関連の型定義

export interface SubscriptionData extends BaseEntity {
  userId: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate: string | Date;
  subscribedAt: string | Date;
}

export interface CreateSubscriptionRequest {
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate?: string | Date;
}

export interface UpdateSubscriptionRequest
  extends Partial<CreateSubscriptionRequest> {
  id: string;
}

export interface SubscriptionStats {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  categoryBreakdown: Record<string, number>;
  currencyBreakdown: Record<string, number>;
}

export interface SubscriptionCalendarEvent {
  id: string;
  title: string;
  date: Date;
  category: string;
  price: number;
  currency: string;
}

export type PaymentCycle =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'SEMI_ANNUALLY'
  | 'ANNUALLY';

export type SubscriptionCategory =
  | 'VIDEO_STREAMING'
  | 'MUSIC_STREAMING'
  | 'READING'
  | 'GAMING'
  | 'FITNESS'
  | 'EDUCATION'
  | 'PRODUCTIVITY'
  | 'CLOUD_STORAGE'
  | 'SECURITY'
  | 'OTHER';

export interface CategoryConfig {
  value: SubscriptionCategory;
  label: string;
  color: string;
  icon?: string;
}

export interface PaymentCycleConfig {
  value: PaymentCycle;
  label: string;
  days: number;
}
