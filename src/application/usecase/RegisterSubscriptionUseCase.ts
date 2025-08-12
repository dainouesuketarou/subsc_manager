import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Subscription } from '../../domain/entities/Subscription';
import { Money } from '../../domain/value-objects/Money';
import { PaymentCycleValue } from '../../domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../domain/value-objects/SubscriptionCategory';
import { Email } from '../../domain/value-objects/Email';

export interface RegisterSubscriptionRequest {
  userId: string;
  userEmail: string;
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
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    request: RegisterSubscriptionRequest
  ): Promise<RegisterSubscriptionResponse> {
    const {
      userId,
      userEmail,
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

    // PrismaのUserテーブルにレコードが存在するかチェック
    let user: { getId: () => string } | null = null;
    try {
      // まずSupabaseのユーザーIDで検索
      user = await this.userRepository.findBySupabaseUserId(userId);
      if (!user) {
        // ユーザーが存在しない場合は作成
        await this.userRepository.createWithSupabaseUser(
          new Email(userEmail),
          userId
        );
        // 作成後に再度取得
        user = await this.userRepository.findBySupabaseUserId(userId);
      }
    } catch (error) {
      console.warn('Failed to create user in Prisma:', error);
      // ユーザー作成に失敗してもサブスクリプション作成は続行
    }

    // バリューオブジェクトを作成（これらは内部でバリデーションを行う）
    const money = Money.create(price, currency);
    const paymentCycleValue = PaymentCycleValue.create(paymentCycle);
    const categoryValue = SubscriptionCategoryValue.create(category);

    // サブスクリプションエンティティを作成
    const subscription = Subscription.create(
      user?.getId() || userId, // ユーザーが取得できた場合はそのID、そうでなければSupabaseのユーザーID
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
