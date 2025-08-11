import { PrismaClient } from '@prisma/client';
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
        updated_at: dto.updated_at,
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

    // バリデーション付きで安全に作成
    const money = Money.create(
      subscriptionData.price,
      subscriptionData.currency
    );
    const paymentCycle = PaymentCycleValue.create(
      subscriptionData.payment_cycle
    );

    const category = SubscriptionCategoryValue.create(
      subscriptionData.category
    );
    const dto: SubscriptionDTO = {
      id: subscriptionData.id,
      userId: subscriptionData.user_id,
      name: subscriptionData.name,
      money: money,
      paymentCycle: paymentCycle,
      category: category,
      paymentStartDate: subscriptionData.payment_start_date,
      subscribedAt: subscriptionData.subscribed_at,
      updated_at: subscriptionData.updated_at,
    };
    return Subscription.reconstitute(dto);
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptionsData = await this.prisma.subscription.findMany({
      where: { user_id: userId },
    });

    return subscriptionsData.map(data => {
      // バリデーション付きで安全に作成
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
        updated_at: data.updated_at,
      };
      return Subscription.reconstitute(dto);
    });
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
}
