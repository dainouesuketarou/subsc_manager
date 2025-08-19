import { UpdateSubscriptionUseCase } from '../../../src/application/usecase/UpdateSubscriptionUseCase';
import { ISubscriptionRepository } from '../../../src/domain/repositories/ISubscriptionRepository';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { Subscription } from '../../../src/domain/entities/Subscription';
import { Money } from '../../../src/domain/value-objects/Money';
import { PaymentCycleValue } from '../../../src/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../../src/domain/value-objects/SubscriptionCategory';
import { User } from '../../../src/domain/entities/User';

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
  let mockUser: User;

  beforeEach(() => {
    useCase = new UpdateSubscriptionUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();

    // モックサブスクリプションを作成
    mockSubscription = Subscription.reconstitute({
      id: 'sub-123',
      userId: 'user-123',
      name: 'Netflix',
      money: Money.create(1000, 'JPY'),
      paymentCycle: PaymentCycleValue.create('MONTHLY'),
      category: SubscriptionCategoryValue.create('VIDEO_STREAMING'),
      paymentStartDate: new Date(),
      subscribedAt: new Date(),
      updatedAt: new Date(),
    });

    // モックユーザーを作成
    mockUser = User.create('test@example.com');
  });

  describe('execute', () => {
    describe('正常系テスト', () => {
      it('有効なリクエストでサブスクリプションを更新できる', async () => {
        const request = {
          id: 'sub-123',
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

      it('SupabaseユーザーIDでサブスクリプションを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'supabase-user-456',
          name: 'Netflix Premium',
          price: 1500,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        // モックサブスクリプションをSupabaseユーザーID用に作成
        const supabaseSubscription = Subscription.reconstitute({
          id: 'sub-123',
          userId: mockUser.getId(),
          name: 'Netflix',
          money: Money.create(1000, 'JPY'),
          paymentCycle: PaymentCycleValue.create('MONTHLY'),
          category: SubscriptionCategoryValue.create('VIDEO_STREAMING'),
          paymentStartDate: new Date(),
          subscribedAt: new Date(),
          updatedAt: new Date(),
        });

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(mockUser);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(supabaseSubscription);
        mockSubscriptionRepository.update = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockUserRepository.findBySupabaseUserId).toHaveBeenCalledWith(
          'supabase-user-456'
        );
        expect(mockSubscriptionRepository.update).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('名前のみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix Premium',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('価格のみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1500,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('通貨のみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'USD',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('支払いサイクルのみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'ANNUALLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('カテゴリーのみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'MUSIC_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('支払い開始日のみを更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
          paymentStartDate: new Date('2024-01-15'),
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('複数のフィールドを同時に更新できる', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix Premium',
          price: 1500,
          currency: 'USD',
          paymentCycle: 'ANNUALLY',
          category: 'MUSIC_STREAMING',
          paymentStartDate: new Date('2024-01-15'),
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
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

      it('異なるカテゴリーでサブスクリプションを更新できる', async () => {
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

        for (const category of categories) {
          const request = {
            id: 'sub-123',
            userId: 'user-123',
            name: 'Netflix',
            price: 1000,
            currency: 'JPY',
            paymentCycle: 'MONTHLY',
            category,
          };

          mockUserRepository.findBySupabaseUserId = jest
            .fn()
            .mockResolvedValue(null);
          mockSubscriptionRepository.findById = jest
            .fn()
            .mockResolvedValue(mockSubscription);
          mockSubscriptionRepository.update = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.update).toHaveBeenCalled();
          expect(result.success).toBe(true);
        }
      });

      it('異なる通貨でサブスクリプションを更新できる', async () => {
        const currencies = ['JPY', 'USD', 'EUR'];

        for (const currency of currencies) {
          const request = {
            id: 'sub-123',
            userId: 'user-123',
            name: 'Netflix',
            price: 1000,
            currency,
            paymentCycle: 'MONTHLY',
            category: 'VIDEO_STREAMING',
          };

          mockUserRepository.findBySupabaseUserId = jest
            .fn()
            .mockResolvedValue(null);
          mockSubscriptionRepository.findById = jest
            .fn()
            .mockResolvedValue(mockSubscription);
          mockSubscriptionRepository.update = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.update).toHaveBeenCalled();
          expect(result.success).toBe(true);
        }
      });

      it('異なる支払いサイクルでサブスクリプションを更新できる', async () => {
        const cycles = ['DAILY', 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

        for (const cycle of cycles) {
          const request = {
            id: 'sub-123',
            userId: 'user-123',
            name: 'Netflix',
            price: 1000,
            currency: 'JPY',
            paymentCycle: cycle,
            category: 'VIDEO_STREAMING',
          };

          mockUserRepository.findBySupabaseUserId = jest
            .fn()
            .mockResolvedValue(null);
          mockSubscriptionRepository.findById = jest
            .fn()
            .mockResolvedValue(mockSubscription);
          mockSubscriptionRepository.update = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.update).toHaveBeenCalled();
          expect(result.success).toBe(true);
        }
      });
    });

    describe('バリデーションテスト', () => {
      it('subscriptionIdが空の場合にエラーをスローする', async () => {
        const request = {
          id: '',
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

      it('subscriptionIdがnullの場合にエラーをスローする', async () => {
        const request = {
          id: null as unknown as string,
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

      it('subscriptionIdがundefinedの場合にエラーをスローする', async () => {
        const request = {
          id: undefined as unknown as string,
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
          id: 'sub-123',
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

      it('userIdがnullの場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: null as unknown as string,
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

      it('userIdがundefinedの場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: undefined as unknown as string,
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

      it('nameが空の場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
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

      it('priceが0以下の場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 0,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);

        await expect(useCase.execute(request)).rejects.toThrow(
          '必須フィールドが不足しています'
        );
      });

      it('priceが負の値の場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: -100,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);

        await expect(useCase.execute(request)).rejects.toThrow(
          '金額は0以上である必要があります: -100'
        );
      });

      it('無効な通貨でエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
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

        await expect(useCase.execute(request)).rejects.toThrow(
          '無効な通貨です: INVALID. 有効な通貨: JPY, USD, EUR'
        );
      });

      it('無効な支払いサイクルでエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
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

        await expect(useCase.execute(request)).rejects.toThrow(
          'Invalid payment cycle: INVALID'
        );
      });

      it('無効なカテゴリーでエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
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

        await expect(useCase.execute(request)).rejects.toThrow(
          'Invalid subscription category: INVALID_CATEGORY'
        );
      });
    });

    describe('存在確認テスト', () => {
      it('サブスクリプションが存在しない場合にエラーをスローする', async () => {
        const request = {
          id: 'non-existent',
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

      it('存在しないSupabaseユーザーIDでも正常に処理される', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix Premium',
          price: 1500,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.update = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });
    });

    describe('権限テスト', () => {
      it('他のユーザーのサブスクリプションを更新しようとした場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
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

      it('SupabaseユーザーIDで他のユーザーのサブスクリプションを更新しようとした場合にエラーをスローする', async () => {
        const otherUser = User.create('other@example.com');

        const request = {
          id: 'sub-123',
          userId: 'supabase-other-user',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(otherUser);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);

        await expect(useCase.execute(request)).rejects.toThrow(
          'このサブスクリプションを更新する権限がありません'
        );
      });
    });

    describe('エラーハンドリングテスト', () => {
      it('findByIdでエラーが発生した場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('Database connection error'));

        await expect(useCase.execute(request)).rejects.toThrow(
          'Database connection error'
        );
      });

      it('updateでエラーが発生した場合にエラーをスローする', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        // 権限チェックを通過するようにモックサブスクリプションのユーザーIDを設定
        const subscriptionWithCorrectUserId = Subscription.reconstitute({
          id: 'sub-123',
          userId: 'user-123', // リクエストのuserIdと一致
          name: 'Netflix',
          money: Money.create(1000, 'JPY'),
          paymentCycle: PaymentCycleValue.create('MONTHLY'),
          category: SubscriptionCategoryValue.create('VIDEO_STREAMING'),
          paymentStartDate: new Date(),
          subscribedAt: new Date(),
          updatedAt: new Date(),
        });

        // findBySupabaseUserIdがnullを返すようにモック（通常のユーザーIDとして扱う）
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);

        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(subscriptionWithCorrectUserId);
        mockSubscriptionRepository.update = jest
          .fn()
          .mockRejectedValue(new Error('Update operation failed'));

        await expect(useCase.execute(request)).rejects.toThrow(
          'Update operation failed'
        );
      });

      it('findBySupabaseUserIdでエラーが発生しても処理を継続する', async () => {
        const request = {
          id: 'sub-123',
          userId: 'supabase-user-456',
          name: 'Netflix Premium',
          price: 1500,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        // モックサブスクリプションをSupabaseユーザーID用に作成
        const supabaseSubscription = Subscription.reconstitute({
          id: 'sub-123',
          userId: 'supabase-user-456',
          name: 'Netflix',
          money: Money.create(1000, 'JPY'),
          paymentCycle: PaymentCycleValue.create('MONTHLY'),
          category: SubscriptionCategoryValue.create('VIDEO_STREAMING'),
          paymentStartDate: new Date(),
          subscribedAt: new Date(),
          updatedAt: new Date(),
        });

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('Supabase connection error'));
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(supabaseSubscription);
        mockSubscriptionRepository.update = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });
    });

    describe('境界値テスト', () => {
      it('非常に長いnameでも正常に処理される', async () => {
        const longName = 'a'.repeat(1000);
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: longName,
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
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });

      it('非常に大きなpriceでも正常に処理される', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 999999999,
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

        expect(result.success).toBe(true);
      });

      it('小数点を含むpriceでも正常に処理される', async () => {
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix',
          price: 999.99,
          currency: 'USD',
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

        expect(result.success).toBe(true);
      });

      it('特殊文字を含むnameでも正常に処理される', async () => {
        const specialName = 'Service!@#$%^&*()_+-=[]{}|;:,.<>?';
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: specialName,
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
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });

      it('Unicode文字を含むnameでも正常に処理される', async () => {
        const unicodeName = 'サービス-서비스-服务';
        const request = {
          id: 'sub-123',
          userId: 'user-123',
          name: unicodeName,
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
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });
    });

    describe('パフォーマンステスト', () => {
      it('大量の更新リクエストを高速で処理できる', async () => {
        const requests = Array.from({ length: 100 }, (_, i) => ({
          id: `sub-${i}`,
          userId: 'user-123',
          name: `Service ${i + 1}`,
          price: 1000 + i,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        }));

        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.update = jest
          .fn()
          .mockResolvedValue(undefined);

        const startTime = Date.now();
        const promises = requests.map(request => useCase.execute(request));
        const results = await Promise.all(promises);
        const endTime = Date.now();

        expect(results).toHaveLength(100);
        results.forEach(result => {
          expect(result.success).toBe(true);
        });
        expect(endTime - startTime).toBeLessThan(5000); // 5秒以内
      });
    });

    describe('同時実行テスト', () => {
      it('同じサブスクリプションに対する複数の更新リクエストを処理できる', async () => {
        const request = {
          id: 'sub-123',
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

        const promises = Array.from({ length: 5 }, () =>
          useCase.execute(request)
        );
        const results = await Promise.all(promises);

        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(result.success).toBe(true);
        });
        expect(mockSubscriptionRepository.findById).toHaveBeenCalledTimes(5);
        expect(mockSubscriptionRepository.update).toHaveBeenCalledTimes(5);
      });
    });

    describe('データ整合性テスト', () => {
      it('更新後に同じIDで再度更新できる', async () => {
        const request1 = {
          id: 'sub-123',
          userId: 'user-123',
          name: 'Netflix Premium',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        const request2 = {
          id: 'sub-123',
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

        const result1 = await useCase.execute(request1);
        const result2 = await useCase.execute(request2);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
      });
    });
  });
});
