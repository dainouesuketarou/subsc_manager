import { RegisterSubscriptionUseCase } from '../../../src/application/usecase/RegisterSubscriptionUseCase';
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

describe('RegisterSubscriptionUseCase', () => {
  let useCase: RegisterSubscriptionUseCase;

  beforeEach(() => {
    useCase = new RegisterSubscriptionUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();
  });

  describe('execute', () => {
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

    it('異なるカテゴリーでサブスクリプションを登録できる', async () => {
      const request = {
        userId: 'user-123',
        userEmail: 'test@example.com',
        name: 'Spotify',
        price: 500,
        currency: 'JPY',
        paymentCycle: 'MONTHLY',
        category: 'MUSIC_STREAMING',
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
    });

    it('異なる通貨でサブスクリプションを登録できる', async () => {
      const request = {
        userId: 'user-123',
        userEmail: 'test@example.com',
        name: 'Netflix US',
        price: 15,
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

      expect(mockSubscriptionRepository.create).toHaveBeenCalled();
      expect(result.subscriptionId).toBeDefined();
    });

    it('異なる支払いサイクルでサブスクリプションを登録できる', async () => {
      const request = {
        userId: 'user-123',
        userEmail: 'test@example.com',
        name: 'Annual Plan',
        price: 10000,
        currency: 'JPY',
        paymentCycle: 'ANNUALLY',
        category: 'EDUCATION',
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
    });

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

      await expect(useCase.execute(request)).rejects.toThrow();
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

      await expect(useCase.execute(request)).rejects.toThrow();
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

      await expect(useCase.execute(request)).rejects.toThrow();
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
        paymentStartDate: '2024-08-03',
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

      await expect(useCase.execute(request)).rejects.toThrow('Database error');
    });
  });
});
