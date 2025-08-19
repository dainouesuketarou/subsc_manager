import { PrismaClient } from '@prisma/client';
import { ISubscriptionRepository } from '../domain/repositories/ISubscriptionRepository';
import { Subscription } from '../domain/entities/Subscription';
import { Money, Currency } from '../domain/value-objects/Money';
import { PaymentCycleValue } from '../domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../domain/value-objects/SubscriptionCategory';
import { prisma } from './utils/PrismaClient';

export class PrismaSubscriptionRepository implements ISubscriptionRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.prismaClient.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    return Subscription.reconstitute({
      id: subscription.id,
      userId: subscription.user_id,
      name: subscription.name,
      money: new Money(subscription.price, subscription.currency as Currency),
      paymentCycle: PaymentCycleValue.create(subscription.payment_cycle),
      category: SubscriptionCategoryValue.create(subscription.category),
      paymentStartDate: subscription.payment_start_date,
      subscribedAt: subscription.subscribed_at,
      updatedAt: subscription.updated_at,
    });
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await this.prismaClient.subscription.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });

    return subscriptions.map(subscription =>
      Subscription.reconstitute({
        id: subscription.id,
        userId: subscription.user_id,
        name: subscription.name,
        money: new Money(subscription.price, subscription.currency as Currency),
        paymentCycle: PaymentCycleValue.create(subscription.payment_cycle),
        category: SubscriptionCategoryValue.create(subscription.category),
        paymentStartDate: subscription.payment_start_date,
        subscribedAt: subscription.subscribed_at,
        updatedAt: subscription.updated_at,
      })
    );
  }

  async create(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();

    const data = {
      id: dto.id,
      user_id: dto.userId,
      name: dto.name,
      price: dto.money.amount,
      currency: dto.money.currency as Currency,
      payment_cycle: dto.paymentCycle.value,
      category: dto.category.getValue(),
      payment_start_date: dto.paymentStartDate,
      subscribed_at: dto.subscribedAt,
      updated_at: dto.updatedAt,
    };

    await this.prismaClient.subscription.create({
      data,
    });
  }

  async update(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();

    const data = {
      user_id: dto.userId,
      name: dto.name,
      price: dto.money.amount,
      currency: dto.money.currency as Currency,
      payment_cycle: dto.paymentCycle.value,
      category: dto.category.getValue(),
      payment_start_date: dto.paymentStartDate,
      subscribed_at: dto.subscribedAt,
      updated_at: dto.updatedAt,
    };

    await this.prismaClient.subscription.update({
      where: { id: dto.id },
      data,
    });
  }

  async delete(subscriptionId: string): Promise<void> {
    await this.prismaClient.subscription.delete({
      where: { id: subscriptionId },
    });
  }
}
