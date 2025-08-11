import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { Subscription } from '../../domain/entities/Subscription';
import { Money } from '../../domain/value-objects/Money';
import { PaymentCycleValue } from '../../domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../domain/value-objects/SubscriptionCategory';

export interface RegisterSubscriptionRequest {
  userId: string;
  name: string;
  price: number;
  currency: string;
  paymentCycle: string;
  category: string;
  paymentStartDate?: string;
}

export interface RegisterSubscriptionResponse {
  subscriptionId: string;
}

export class RegisterSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: RegisterSubscriptionRequest
  ): Promise<RegisterSubscriptionResponse> {
    const {
      userId,
      name,
      price,
      currency,
      paymentCycle,
      category,
      paymentStartDate,
    } = request;

    // バリデーション
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!name || !price || !currency || !paymentCycle || !category) {
      throw new Error('必須フィールドが不足しています');
    }

    if (typeof price !== 'number' || price <= 0) {
      throw new Error('Price must be a positive number');
    }

    // バリューオブジェクトを作成（これらは内部でバリデーションを行う）
    const money = Money.create(price, currency);
    const paymentCycleValue = PaymentCycleValue.create(paymentCycle);
    const categoryValue = SubscriptionCategoryValue.create(category);

    // サブスクリプションエンティティを作成
    const subscription = Subscription.create(
      userId,
      name,
      money,
      paymentCycleValue,
      categoryValue,
      paymentStartDate ? new Date(paymentStartDate) : undefined
    );

    // リポジトリに保存
    await this.subscriptionRepository.create(subscription);

    return {
      subscriptionId: subscription.toDTO().id,
    };
  }
}
