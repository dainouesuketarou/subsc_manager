import { GetSubscriptionsUseCase } from '../../../src/application/usecase/GetSubscriptionsUseCase';
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

describe('GetSubscriptionsUseCase', () => {
  let useCase: GetSubscriptionsUseCase;

  beforeEach(() => {
    useCase = new GetSubscriptionsUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('ユーザーのサブスクリプション一覧を取得できる', async () => {
      const mockSubscriptions = [
        Subscription.create(
          'user-123',
          'Netflix',
          Money.create(1000, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        ),
        Subscription.create(
          'user-123',
          'Spotify',
          Money.create(500, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('MUSIC_STREAMING')
        ),
      ];

      mockSubscriptionRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(mockSubscriptions);

      const request = { userId: 'user-123' };
      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        'user-123'
      );
      expect(result.subscriptions).toHaveLength(2);
      expect(result.subscriptions[0].name).toBe('Netflix');
      expect(result.subscriptions[0].price).toBe(1000);
      expect(result.subscriptions[0].currency).toBe('JPY');
      expect(result.subscriptions[0].paymentCycle).toBe('MONTHLY');
      expect(result.subscriptions[0].category).toBe('VIDEO_STREAMING');
      expect(result.subscriptions[1].name).toBe('Spotify');
      expect(result.subscriptions[1].price).toBe(500);
      expect(result.subscriptions[1].currency).toBe('JPY');
      expect(result.subscriptions[1].paymentCycle).toBe('MONTHLY');
      expect(result.subscriptions[1].category).toBe('MUSIC_STREAMING');
    });

    it('サブスクリプションが存在しない場合、空配列を返す', async () => {
      mockSubscriptionRepository.findByUserId = jest.fn().mockResolvedValue([]);

      const request = { userId: 'user-with-no-subs' };
      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        'user-with-no-subs'
      );
      expect(result.subscriptions).toHaveLength(0);
    });

    it('異なる通貨のサブスクリプションを正しく変換する', async () => {
      const mockSubscriptions = [
        Subscription.create(
          'user-123',
          'Netflix US',
          Money.create(15, 'USD'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        ),
      ];

      mockSubscriptionRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(mockSubscriptions);

      const request = { userId: 'user-123' };
      const result = await useCase.execute(request);

      expect(result.subscriptions[0].currency).toBe('USD');
      expect(result.subscriptions[0].price).toBe(15);
    });

    it('異なる支払いサイクルのサブスクリプションを正しく変換する', async () => {
      const mockSubscriptions = [
        Subscription.create(
          'user-123',
          'Annual Plan',
          Money.create(10000, 'JPY'),
          PaymentCycleValue.create('ANNUALLY'),
          SubscriptionCategoryValue.create('EDUCATION')
        ),
      ];

      mockSubscriptionRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(mockSubscriptions);

      const request = { userId: 'user-123' };
      const result = await useCase.execute(request);

      expect(result.subscriptions[0].paymentCycle).toBe('ANNUALLY');
      expect(result.subscriptions[0].category).toBe('EDUCATION');
    });

    it('異なるカテゴリーのサブスクリプションを正しく変換する', async () => {
      const categories = [
        'VIDEO_STREAMING',
        'MUSIC_STREAMING',
        'READING',
        'GAMING',
        'FITNESS',
        'EDUCATION',
        'PRODUCTIVITY',
        'CLOUD_STORAGE',
        'SECURITY',
        'OTHER',
      ];

      const mockSubscriptions = categories.map((category, index) =>
        Subscription.create(
          'user-123',
          `Service ${index + 1}`,
          Money.create(1000, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create(category)
        )
      );

      mockSubscriptionRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(mockSubscriptions);

      const request = { userId: 'user-123' };
      const result = await useCase.execute(request);

      expect(result.subscriptions).toHaveLength(categories.length);
      categories.forEach((category, index) => {
        expect(result.subscriptions[index].category).toBe(category);
      });
    });

    it('リポジトリでエラーが発生した場合にエラーをスローする', async () => {
      mockSubscriptionRepository.findByUserId = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      const request = { userId: 'user-123' };

      await expect(useCase.execute(request)).rejects.toThrow('Database error');
    });

    it('userIdが空の場合でも正常に処理される', async () => {
      mockSubscriptionRepository.findByUserId = jest.fn().mockResolvedValue([]);

      const request = { userId: '' };
      const result = await useCase.execute(request);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith('');
      expect(result.subscriptions).toHaveLength(0);
    });
  });
});
