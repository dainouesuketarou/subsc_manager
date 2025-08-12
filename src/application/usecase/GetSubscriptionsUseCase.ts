import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Subscription } from '../../domain/entities/Subscription';

export interface GetSubscriptionsRequest {
  userId: string;
}

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

export interface GetSubscriptionsResponse {
  subscriptions: SubscriptionDTO[];
}

export class GetSubscriptionsUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    request: GetSubscriptionsRequest
  ): Promise<GetSubscriptionsResponse> {
    // SupabaseのユーザーIDをPrismaのユーザーIDに変換
    let prismaUserId = request.userId;
    try {
      const user = await this.userRepository.findBySupabaseUserId(
        request.userId
      );
      if (user) {
        prismaUserId = user.getId();
      }
    } catch (error) {
      console.warn('Failed to find user by Supabase ID:', error);
    }

    const subscriptions =
      await this.subscriptionRepository.findByUserId(prismaUserId);

    const subscriptionDTOs = subscriptions.map(subscription => {
      const dto = subscription.toDTO();
      return {
        id: dto.id,
        userId: dto.userId,
        name: dto.name,
        price: dto.money.amount,
        currency: dto.money.currency,
        paymentCycle: dto.paymentCycle.value,
        category: dto.category.getValue(),
        paymentStartDate: dto.paymentStartDate,
        subscribedAt: dto.subscribedAt,
        updatedAt: dto.updatedAt,
      };
    });

    return {
      subscriptions: subscriptionDTOs,
    };
  }
}
