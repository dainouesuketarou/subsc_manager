import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import {
  GetSubscriptionsDTO,
  SubscriptionResponseDTO,
} from '../dto/subscription';

export class GetSubscriptionsUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    request: GetSubscriptionsDTO
  ): Promise<SubscriptionResponseDTO> {
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
