import {
  PrismaClient,
  Subscription as PrismaSubscription,
} from '@prisma/client';
import { Subscription, SubscriptionDTO } from '../domain/entities/Subscription';
import { ISubscriptionRepository } from '../domain/repositories/ISubscriptionRepository';
import { Money } from '../domain/value-objects/Money';
import { PaymentCycleValue } from '../domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../domain/value-objects/SubscriptionCategory';

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();
    await this.prisma.subscription.create({
      data: {
        id: dto.id,
        user_id: dto.userId,
        name: dto.name,
        price: dto.money.amount,
        currency: dto.money.currency,
        payment_cycle: dto.paymentCycle.value,
        category: dto.category.getValue(),
        payment_start_date: dto.paymentStartDate,
        subscribed_at: dto.subscribedAt,
        updated_at: dto.updatedAt,
      },
    });
  }

  async findById(subscriptionId: string): Promise<Subscription | null> {
    const subscriptionData = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscriptionData) {
      return null;
    }

    return this.convertToSubscription(subscriptionData);
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptionsData = await this.prisma.subscription.findMany({
      where: { user_id: userId },
    });

    return subscriptionsData.map(data => this.convertToSubscription(data));
  }

  async update(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();
    await this.prisma.subscription.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        price: dto.money.amount,
        currency: dto.money.currency,
        payment_cycle: dto.paymentCycle.value,
        category: dto.category.getValue(),
        payment_start_date: dto.paymentStartDate,
        updated_at: new Date(),
      },
    });
  }

  async delete(subscriptionId: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    });
  }

  private convertToSubscription(data: PrismaSubscription): Subscription {
    const money = Money.create(data.price, data.currency);
    const paymentCycle = PaymentCycleValue.create(data.payment_cycle);
    const category = SubscriptionCategoryValue.create(data.category);

    const dto: SubscriptionDTO = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      money: money,
      paymentCycle: paymentCycle,
      category: category,
      paymentStartDate: data.payment_start_date,
      subscribedAt: data.subscribed_at,
      updatedAt: data.updated_at,
    };
    return Subscription.reconstitute(dto);
  }
}
