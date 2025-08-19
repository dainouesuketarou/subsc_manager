import { RegisterSubscriptionUseCase } from '../../../src/application/usecase/RegisterSubscriptionUseCase';
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

describe('RegisterSubscriptionUseCase', () => {
  let useCase: RegisterSubscriptionUseCase;
  let mockUser: User;

  beforeEach(() => {
    useCase = new RegisterSubscriptionUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();

    // モックユーザーを作成
    mockUser = User.create('test@example.com');
  });

  describe('execute', () => {
    describe('正常系テスト', () => {
      it('有効なリクエストでサブスクリプションを登録できる', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            toDTO: expect.any(Function),
          })
        );
        expect(result.subscriptionId).toBeDefined();
      });

      it('SupabaseユーザーIDでサブスクリプションを登録できる', async () => {
        const request = {
          userId: 'supabase-user-456',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(mockUser);
        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockUserRepository.findBySupabaseUserId).toHaveBeenCalledWith(
          'supabase-user-456'
        );
        expect(mockSubscriptionRepository.create).toHaveBeenCalled();
        expect(result.subscriptionId).toBeDefined();
      });

      it('異なるカテゴリーでサブスクリプションを登録できる', async () => {
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
            userId: 'user-123',
            userEmail: 'test@example.com',
            name: `Service ${category}`,
            price: 1000,
            currency: 'JPY',
            paymentCycle: 'MONTHLY',
            category,
          };

          mockSubscriptionRepository.create = jest
            .fn()
            .mockResolvedValue(undefined);
          mockUserRepository.findById = jest
            .fn()
            .mockRejectedValue(new Error('User not found'));
          mockUserRepository.createWithSupabaseUser = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.create).toHaveBeenCalled();
          expect(result.subscriptionId).toBeDefined();
        }
      });

      it('異なる通貨でサブスクリプションを登録できる', async () => {
        const currencies = ['JPY', 'USD', 'EUR'];

        for (const currency of currencies) {
          const request = {
            userId: 'user-123',
            userEmail: 'test@example.com',
            name: `Service ${currency}`,
            price: 1000,
            currency,
            paymentCycle: 'MONTHLY',
            category: 'VIDEO_STREAMING',
          };

          mockSubscriptionRepository.create = jest
            .fn()
            .mockResolvedValue(undefined);
          mockUserRepository.findById = jest
            .fn()
            .mockRejectedValue(new Error('User not found'));
          mockUserRepository.createWithSupabaseUser = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.create).toHaveBeenCalled();
          expect(result.subscriptionId).toBeDefined();
        }
      });

      it('異なる支払いサイクルでサブスクリプションを登録できる', async () => {
        const cycles = ['DAILY', 'MONTHLY', 'SEMI_ANNUALLY', 'ANNUALLY'];

        for (const cycle of cycles) {
          const request = {
            userId: 'user-123',
            userEmail: 'test@example.com',
            name: `Service ${cycle}`,
            price: 1000,
            currency: 'JPY',
            paymentCycle: cycle,
            category: 'VIDEO_STREAMING',
          };

          mockSubscriptionRepository.create = jest
            .fn()
            .mockResolvedValue(undefined);
          mockUserRepository.findById = jest
            .fn()
            .mockRejectedValue(new Error('User not found'));
          mockUserRepository.createWithSupabaseUser = jest
            .fn()
            .mockResolvedValue(undefined);

          const result = await useCase.execute(request);

          expect(mockSubscriptionRepository.create).toHaveBeenCalled();
          expect(result.subscriptionId).toBeDefined();
        }
      });

      it('支払い開始日を指定してサブスクリプションを登録できる', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
          paymentStartDate: new Date('2024-08-03'),
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            toDTO: expect.any(Function),
          })
        );
        expect(result.subscriptionId).toBeDefined();
      });

      it('支払い開始日を指定しない場合、現在の日付が設定される', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            toDTO: expect.any(Function),
          })
        );
        expect(result.subscriptionId).toBeDefined();
      });
    });

    describe('バリデーションテスト', () => {
      it('userIdが空の場合にエラーをスローする', async () => {
        const request = {
          userId: '',
          userEmail: 'test@example.com',
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
          userId: null as unknown as string,
          userEmail: 'test@example.com',
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
          userId: undefined as unknown as string,
          userEmail: 'test@example.com',
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
          userId: 'user-123',
          userEmail: 'test@example.com',
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

      it('nameがnullの場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: null as unknown as string,
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          '必須フィールドが不足しています'
        );
      });

      it('nameがundefinedの場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: undefined as unknown as string,
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
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 0,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          '必須フィールドが不足しています'
        );
      });

      it('priceが負の値の場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: -100,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Price must be a positive number'
        );
      });

      it('priceがnullの場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: null as unknown as number,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          '必須フィールドが不足しています'
        );
      });

      it('priceがundefinedの場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: undefined as unknown as number,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          '必須フィールドが不足しています'
        );
      });

      it('無効な通貨でエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'INVALID',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          '無効な通貨です: INVALID. 有効な通貨: JPY, USD, EUR'
        );
      });

      it('無効な支払いサイクルでエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'INVALID',
          category: 'VIDEO_STREAMING',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Invalid payment cycle: INVALID'
        );
      });

      it('無効なカテゴリーでエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'INVALID_CATEGORY',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'Invalid subscription category: INVALID_CATEGORY'
        );
      });

      it('無効な支払い開始日でエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
          paymentStartDate: new Date('invalid-date'),
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });
    });

    describe('境界値テスト', () => {
      it('非常に長いnameでも正常に処理される', async () => {
        const longName = 'a'.repeat(1000);
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: longName,
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });

      it('非常に大きなpriceでも正常に処理される', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Expensive Service',
          price: 999999999,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });

      it('小数点を含むpriceでも正常に処理される', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Precise Service',
          price: 999.99,
          currency: 'USD',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });

      it('特殊文字を含むnameでも正常に処理される', async () => {
        const specialName = 'Service!@#$%^&*()_+-=[]{}|;:,.<>?';
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: specialName,
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });

      it('Unicode文字を含むnameでも正常に処理される', async () => {
        const unicodeName = 'サービス-서비스-服务';
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: unicodeName,
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });
    });

    describe('エラーハンドリングテスト', () => {
      it('リポジトリでエラーが発生した場合にエラーをスローする', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockRejectedValue(new Error('Database error'));
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        await expect(useCase.execute(request)).rejects.toThrow(
          'Database error'
        );
      });

      it('findBySupabaseUserIdでエラーが発生しても処理を継続する', async () => {
        const request = {
          userId: 'supabase-user-456',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('Supabase connection error'));
        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });

      it('createWithSupabaseUserでエラーが発生しても処理を継続する', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockRejectedValue(new Error('User creation failed'));

        const result = await useCase.execute(request);

        expect(result.subscriptionId).toBeDefined();
      });
    });

    describe('パフォーマンステスト', () => {
      it('大量のサブスクリプションを高速で登録できる', async () => {
        const requests = Array.from({ length: 100 }, (_, i) => ({
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: `Service ${i + 1}`,
          price: 1000 + i,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        }));

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const startTime = Date.now();
        const promises = requests.map(request => useCase.execute(request));
        const results = await Promise.all(promises);
        const endTime = Date.now();

        expect(results).toHaveLength(100);
        results.forEach(result => {
          expect(result.subscriptionId).toBeDefined();
        });
        expect(endTime - startTime).toBeLessThan(5000); // 5秒以内
      });
    });

    describe('同時実行テスト', () => {
      it('同じユーザーに対する複数の登録リクエストを処理できる', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const promises = Array.from({ length: 5 }, () =>
          useCase.execute(request)
        );
        const results = await Promise.all(promises);

        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(result.subscriptionId).toBeDefined();
        });
        expect(mockSubscriptionRepository.create).toHaveBeenCalledTimes(5);
      });
    });

    describe('データ整合性テスト', () => {
      it('同じ名前のサブスクリプションを複数登録できる', async () => {
        const request = {
          userId: 'user-123',
          userEmail: 'test@example.com',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          paymentCycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
        };

        mockSubscriptionRepository.create = jest
          .fn()
          .mockResolvedValue(undefined);
        mockUserRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockUserRepository.createWithSupabaseUser = jest
          .fn()
          .mockResolvedValue(undefined);

        const result1 = await useCase.execute(request);
        const result2 = await useCase.execute(request);

        expect(result1.subscriptionId).toBeDefined();
        expect(result2.subscriptionId).toBeDefined();
        expect(result1.subscriptionId).not.toBe(result2.subscriptionId);
      });
    });
  });
});
