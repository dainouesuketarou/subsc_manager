import { GetSubscriptionsUseCase } from '../../../src/application/usecase/GetSubscriptionsUseCase';
import { ISubscriptionRepository } from '../../../src/domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { Subscription } from '../../../src/domain/entities/Subscription';
import { Money } from '../../../src/domain/value-objects/Money';
import { PaymentCycleValue } from '../../../src/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../../src/domain/value-objects/SubscriptionCategory';
import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';

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
  let mockUser: User;

  beforeEach(() => {
    useCase = new GetSubscriptionsUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();

    // モックユーザーを作成
    mockUser = User.create('test@example.com');
  });

  describe('execute', () => {
    describe('正常系テスト', () => {
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

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('SupabaseユーザーIDでサブスクリプション一覧を取得できる', async () => {
        const mockSubscriptions = [
          Subscription.create(
            mockUser.getId(),
            'Netflix',
            Money.create(1000, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          ),
        ];

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(mockUser);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'supabase-user-456' };
        const result = await useCase.execute(request);

        expect(mockUserRepository.findBySupabaseUserId).toHaveBeenCalledWith(
          'supabase-user-456'
        );
        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          mockUser.getId()
        );
        expect(result.subscriptions).toHaveLength(1);
        expect(result.subscriptions[0].name).toBe('Netflix');
      });

      it('サブスクリプションが存在しない場合、空配列を返す', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: 'user-with-no-subs' };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          'user-with-no-subs'
        );
        expect(result.subscriptions).toHaveLength(0);
      });

      it('大量のサブスクリプションを正しく取得できる', async () => {
        const mockSubscriptions = Array.from({ length: 100 }, (_, i) =>
          Subscription.create(
            'user-123',
            `Service ${i + 1}`,
            Money.create(1000 + i, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          )
        );

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions).toHaveLength(100);
        expect(result.subscriptions[0].name).toBe('Service 1');
        expect(result.subscriptions[99].name).toBe('Service 100');
      });
    });

    describe('通貨変換テスト', () => {
      it('異なる通貨のサブスクリプションを正しく変換する', async () => {
        const mockSubscriptions = [
          Subscription.create(
            'user-123',
            'Netflix US',
            Money.create(15, 'USD'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          ),
          Subscription.create(
            'user-123',
            'Spotify EU',
            Money.create(10, 'EUR'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('MUSIC_STREAMING')
          ),
        ];

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions[0].currency).toBe('USD');
        expect(result.subscriptions[0].price).toBe(15);
        expect(result.subscriptions[1].currency).toBe('EUR');
        expect(result.subscriptions[1].price).toBe(10);
      });

      it('全ての対応通貨で正しく処理される', async () => {
        const currencies = ['JPY', 'USD', 'EUR'];
        const mockSubscriptions = currencies.map((currency, index) =>
          Subscription.create(
            'user-123',
            `Service ${index + 1}`,
            Money.create(1000, currency),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          )
        );

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions).toHaveLength(currencies.length);
        currencies.forEach((currency, index) => {
          expect(result.subscriptions[index].currency).toBe(currency);
        });
      });
    });

    describe('支払いサイクルテスト', () => {
      it('異なる支払いサイクルのサブスクリプションを正しく変換する', async () => {
        const mockSubscriptions = [
          Subscription.create(
            'user-123',
            'Annual Plan',
            Money.create(10000, 'JPY'),
            PaymentCycleValue.create('ANNUALLY'),
            SubscriptionCategoryValue.create('EDUCATION')
          ),
          Subscription.create(
            'user-123',
            'Monthly Plan',
            Money.create(500, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('FITNESS')
          ),
        ];

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions[0].paymentCycle).toBe('ANNUALLY');
        expect(result.subscriptions[0].category).toBe('EDUCATION');
        expect(result.subscriptions[1].paymentCycle).toBe('MONTHLY');
        expect(result.subscriptions[1].category).toBe('FITNESS');
      });

      it('全ての支払いサイクルで正しく処理される', async () => {
        const cycles = ['DAILY', 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY'];
        const mockSubscriptions = cycles.map((cycle, index) =>
          Subscription.create(
            'user-123',
            `Service ${index + 1}`,
            Money.create(1000, 'JPY'),
            PaymentCycleValue.create(cycle),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          )
        );

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions).toHaveLength(cycles.length);
        cycles.forEach((cycle, index) => {
          expect(result.subscriptions[index].paymentCycle).toBe(cycle);
        });
      });
    });

    describe('カテゴリーテスト', () => {
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

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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
    });

    describe('バリデーションテスト', () => {
      it('userIdが空の場合でも正常に処理される', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: '' };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          ''
        );
        expect(result.subscriptions).toHaveLength(0);
      });

      it('userIdがnullの場合でも正常に処理される', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: null as any };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          null
        );
        expect(result.subscriptions).toHaveLength(0);
      });

      it('userIdがundefinedの場合でも正常に処理される', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: undefined as any };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          undefined
        );
        expect(result.subscriptions).toHaveLength(0);
      });
    });

    describe('エラーハンドリングテスト', () => {
      it('リポジトリでエラーが発生した場合にエラーをスローする', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockRejectedValue(new Error('Database error'));

        const request = { userId: 'user-123' };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Database error'
        );
      });

      it('findBySupabaseUserIdでエラーが発生しても処理を継続する', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('Supabase connection error'));
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: 'supabase-user-456' };
        const result = await useCase.execute(request);

        expect(result.subscriptions).toHaveLength(0);
      });

      it('ネットワークエラーが発生した場合にエラーをスローする', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockRejectedValue(new Error('Network timeout'));

        const request = { userId: 'user-123' };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Network timeout'
        );
      });

      it('データベース接続エラーが発生した場合にエラーをスローする', async () => {
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockRejectedValue(new Error('Connection refused'));

        const request = { userId: 'user-123' };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Connection refused'
        );
      });
    });

    describe('境界値テスト', () => {
      it('非常に長いuserIdでも正常に処理される', async () => {
        const longUserId = 'a'.repeat(1000);
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: longUserId };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          longUserId
        );
        expect(result.subscriptions).toHaveLength(0);
      });

      it('特殊文字を含むuserIdでも正常に処理される', async () => {
        const specialUserId = 'user-123!@#$%^&*()_+-=[]{}|;:,.<>?';
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: specialUserId };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          specialUserId
        );
        expect(result.subscriptions).toHaveLength(0);
      });

      it('Unicode文字を含むuserIdでも正常に処理される', async () => {
        const unicodeUserId = 'user-123-日本語-한국어-中文';
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([]);

        const request = { userId: unicodeUserId };
        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
          unicodeUserId
        );
        expect(result.subscriptions).toHaveLength(0);
      });
    });

    describe('パフォーマンステスト', () => {
      it('大量のサブスクリプションを高速で取得できる', async () => {
        const mockSubscriptions = Array.from({ length: 1000 }, (_, i) =>
          Subscription.create(
            'user-123',
            `Service ${i + 1}`,
            Money.create(1000 + i, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          )
        );

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const startTime = Date.now();
        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);
        const endTime = Date.now();

        expect(result.subscriptions).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
      });

      it('複数のリクエストを並行処理できる', async () => {
        const mockSubscriptions = [
          Subscription.create(
            'user-123',
            'Netflix',
            Money.create(1000, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          ),
        ];

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue(mockSubscriptions);

        const requests = Array.from({ length: 10 }, (_, i) => ({
          userId: `user-${i}`,
        }));

        const startTime = Date.now();
        const promises = requests.map(request => useCase.execute(request));
        const results = await Promise.all(promises);
        const endTime = Date.now();

        expect(results).toHaveLength(10);
        results.forEach(result => {
          expect(result.subscriptions).toHaveLength(1);
        });
        expect(endTime - startTime).toBeLessThan(2000); // 2秒以内
      });
    });

    describe('データ整合性テスト', () => {
      it('破損したサブスクリプションデータでもエラーをスローしない', async () => {
        const corruptedSubscription = {
          ...Subscription.create(
            'user-123',
            'Netflix',
            Money.create(1000, 'JPY'),
            PaymentCycleValue.create('MONTHLY'),
            SubscriptionCategoryValue.create('VIDEO_STREAMING')
          ),
          toDTO: () => ({
            id: 'sub-123',
            userId: 'user-123',
            name: 'Netflix',
            money: {
              amount: 1000,
              currency: 'JPY',
            },
            paymentCycle: {
              value: 'MONTHLY',
            },
            category: {
              getValue: () => 'VIDEO_STREAMING',
            },
            paymentStartDate: new Date(),
          }),
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findByUserId = jest
          .fn()
          .mockResolvedValue([corruptedSubscription]);

        const request = { userId: 'user-123' };
        const result = await useCase.execute(request);

        expect(result.subscriptions).toHaveLength(1);
        expect(result.subscriptions[0].name).toBe('Netflix');
      });
    });
  });
});
