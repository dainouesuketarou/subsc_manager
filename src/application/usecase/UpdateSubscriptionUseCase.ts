import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { Subscription } from '../../domain/entities/Subscription';
import { Money } from '../../domain/value-objects/Money';
import { PaymentCycleValue } from '../../domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../domain/value-objects/SubscriptionCategory';

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  userId: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate?: string;
}

export interface UpdateSubscriptionResponse {
  success: boolean;
}

export class UpdateSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    request: UpdateSubscriptionRequest
  ): Promise<UpdateSubscriptionResponse> {
    const {
      subscriptionId,
      userId,
      name,
      price,
      currency,
      paymentCycle,
      category,
      paymentStartDate,
    } = request;

    if (!subscriptionId) {
      throw new Error('サブスクリプションIDは必須です');
    }

    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!name || !price || !currency || !paymentCycle) {
      throw new Error('必須フィールドが不足しています');
    }

    // サブスクリプションが存在するか、かつユーザーのものかを確認
    const existingSubscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!existingSubscription) {
      throw new Error('サブスクリプションが見つかりません');
    }

    if (existingSubscription.toDTO().userId !== userId) {
      throw new Error('このサブスクリプションを更新する権限がありません');
    }

    // 既存のサブスクリプションを更新用に再構築
    const money = Money.create(price, currency);
    const paymentCycleValue = PaymentCycleValue.create(paymentCycle);

    const categoryValue = SubscriptionCategoryValue.create(category);
    const updatedSubscription = Subscription.reconstitute({
      id: subscriptionId,
      userId: userId,
      name: name,
      money: money,
      paymentCycle: paymentCycleValue,
      category: categoryValue,
      paymentStartDate: paymentStartDate
        ? new Date(paymentStartDate)
        : existingSubscription.toDTO().paymentStartDate,
      subscribedAt: existingSubscription.toDTO().subscribedAt,
      updated_at: new Date(),
    });

    // サブスクリプションを更新
    await this.subscriptionRepository.update(updatedSubscription);

    return { success: true };
  }
}
