import { Subscription, SubscriptionId } from '../entities/Subscription';

export interface ISubscriptionRepository {
  findByUserId(userId: string): Promise<Subscription[]>;
  findById(subscriptionId: SubscriptionId): Promise<Subscription | null>;
  create(subscription: Subscription): Promise<void>;
  update(subscription: Subscription): Promise<void>;
  delete(subscriptionId: SubscriptionId): Promise<void>;
}
