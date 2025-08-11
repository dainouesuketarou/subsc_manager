export interface SubscriptionData {
  id: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate: string | Date;
  subscribedAt: string | Date;
  updatedAt: string | Date;
}
