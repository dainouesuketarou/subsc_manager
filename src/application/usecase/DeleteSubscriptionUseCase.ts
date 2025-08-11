import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';

export interface DeleteSubscriptionRequest {
  subscriptionId: string;
  userId: string;
}

export interface DeleteSubscriptionResponse {
  success: boolean;
}

export class DeleteSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    request: DeleteSubscriptionRequest
  ): Promise<DeleteSubscriptionResponse> {
    const { subscriptionId, userId } = request;

    if (!subscriptionId) {
      throw new Error('サブスクリプションIDは必須です');
    }

    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    // サブスクリプションが存在するか、かつユーザーのものかを確認
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new Error('サブスクリプションが見つかりません');
    }

    if (subscription.toDTO().userId !== userId) {
      throw new Error('このサブスクリプションを削除する権限がありません');
    }

    // サブスクリプションを削除
    await this.subscriptionRepository.delete(subscriptionId);

    return { success: true };
  }
}
