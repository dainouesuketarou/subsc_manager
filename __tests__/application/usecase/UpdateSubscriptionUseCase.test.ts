import { UpdateSubscriptionUseCase } from '../../../src/application/usecase/UpdateSubscriptionUseCase';
import { ISubscriptionRepository } from '../../../src/domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { Subscription } from '../../../src/domain/entities/Subscription';
import { Money } from '../../../src/domain/value-objects/Money';
import { PaymentCycleValue } from '../../../src/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../../src/domain/value-objects/SubscriptionCategory';

// モックリポジトリ
const mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  create: jest.fn(),
  createWithSupabaseUser: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findBySupabaseUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateSubscriptionUseCase', () => {
  let useCase: UpdateSubscriptionUseCase;
  let mockSubscription: Subscription;

  beforeEach(() => {
    useCase = new UpdateSubscriptionUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();

    // モックサブスクリプションを作成
    mockSubscription = Subscription.create(
      'user-123',
      'Netflix',
      Money.create(1000, 'JPY'),
      PaymentCycleValue.create('MONTHLY'),
      SubscriptionCategoryValue.create('VIDEO_STREAMING')
    );
  });

  describe('execute', () => {
    it('有効なリクエストでサブスクリプションを更新できる', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix Premium',
        price: 1500,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.update = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(
        'sub-123'
      );
      expect(mockSubscriptionRepository.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('カテゴリーを変更してサブスクリプションを更新できる', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'MUSIC_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.update = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('支払い開始日を指定してサブスクリプションを更新できる', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
        paymentStartDate: '2024-01-15',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.update = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.update).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('subscriptionIdが空の場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: '',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'サブスクリプションIDは必須です'
      );
    });

    it('userIdが空の場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: '',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'ユーザーIDは必須です'
      );
    });

    it('必須フィールドが不足している場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: '',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        '必須フィールドが不足しています'
      );
    });

    it('サブスクリプションが存在しない場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: 'non-existent',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(useCase.execute(request)).rejects.toThrow(
        'サブスクリプションが見つかりません'
      );
    });

    it('他のユーザーのサブスクリプションを更新しようとした場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'other-user',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);

      await expect(useCase.execute(request)).rejects.toThrow(
        'このサブスクリプションを更新する権限がありません'
      );
    });

    it('無効な通貨でエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'INVALID',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);

      await expect(useCase.execute(request)).rejects.toThrow();
    });

    it('無効な支払いサイクルでエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'INVALID',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);

      await expect(useCase.execute(request)).rejects.toThrow();
    });

    it('無効なカテゴリーでエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'INVALID_CATEGORY',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);

      await expect(useCase.execute(request)).rejects.toThrow();
    });

    it('リポジトリでエラーが発生した場合にエラーをスローする', async () => {
      const request = {
        subscriptionId: 'sub-123',
        userId: 'user-123',
        name: 'Netflix',
        price: 1000,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'VIDEO_STREAMING',
      };

      mockSubscriptionRepository.findById = jest
        .fn()
        .mockResolvedValue(mockSubscription);
      mockSubscriptionRepository.update = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(request)).rejects.toThrow('Database error');
    });
  });
});
