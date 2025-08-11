import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
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
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: GetSubscriptionsRequest
  ): Promise<GetSubscriptionsResponse> {
    const subscriptions = await this.subscriptionRepository.findByUserId(
      request.userId
    );

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
        updatedAt: dto.updated_at,
      };
    });

    return {
      subscriptions: subscriptionDTOs,
    };
  }
}
