import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { DeleteSubscriptionDTO } from '../dto/subscription';

export interface DeleteSubscriptionResponse {
  success: boolean;
}

export class DeleteSubscriptionUseCase {
  constructor(
    private subscriptionRepository: ISubscriptionRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(
    request: DeleteSubscriptionDTO
  ): Promise<DeleteSubscriptionResponse> {
    const { subscriptionId, userId } = request;

    if (!subscriptionId) {
      throw new Error('サブスクリプションIDは必須です');
    }

    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    // SupabaseのユーザーIDをPrismaのユーザーIDに変換
    let prismaUserId = userId;
    try {
      const user = await this.userRepository.findBySupabaseUserId(userId);
      if (user) {
        prismaUserId = user.getId();
      }
    } catch (error) {
      console.warn('Failed to find user by Supabase ID:', error);
    }

    // サブスクリプションが存在するか、かつユーザーのものかを確認
    const subscription =
      await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw new Error('サブスクリプションが見つかりません');
    }

    if (subscription.toDTO().userId !== prismaUserId) {
      throw new Error('このサブスクリプションを削除する権限がありません');
    }

    // サブスクリプションを削除
    await this.subscriptionRepository.delete(subscriptionId);

    return { success: true };
  }
}
