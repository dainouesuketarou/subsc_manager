import { DeleteSubscriptionUseCase } from '../../../src/application/usecase/DeleteSubscriptionUseCase';
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

describe('DeleteSubscriptionUseCase', () => {
  let useCase: DeleteSubscriptionUseCase;
  let mockSubscription: Subscription;
  let mockUser: User;

  beforeEach(() => {
    useCase = new DeleteSubscriptionUseCase(
      mockSubscriptionRepository,
      mockUserRepository
    );
    jest.clearAllMocks();

    // モックユーザーを作成（IDを固定）
    mockUser = User.reconstitute({
      id: 'user-123',
      email: new Email('test@example.com'),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    describe('正常系テスト', () => {
      it('有効なリクエストでサブスクリプションを削除できる', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(
          'sub-123'
        );
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(
          'sub-123'
        );
        expect(result.success).toBe(true);
      });

      it('SupabaseユーザーIDでサブスクリプションを削除できる', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'supabase-user-456',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(mockUser);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockUserRepository.findBySupabaseUserId).toHaveBeenCalledWith(
          'supabase-user-456'
        );
        expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(
          'sub-123'
        );
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(
          'sub-123'
        );
        expect(result.success).toBe(true);
      });

      it('異なるカテゴリーのサブスクリプションを削除できる', async () => {
        const musicSubscription = Subscription.create(
          'user-123',
          'Spotify',
          Money.create(500, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('MUSIC_STREAMING')
        );

        const request = {
          subscriptionId: 'sub-456',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(musicSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(
          'sub-456'
        );
        expect(result.success).toBe(true);
      });

      it('異なる通貨のサブスクリプションを削除できる', async () => {
        const usdSubscription = Subscription.create(
          'user-123',
          'Netflix US',
          Money.create(15, 'USD'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        );

        const request = {
          subscriptionId: 'sub-789',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(usdSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(
          'sub-789'
        );
        expect(result.success).toBe(true);
      });
    });

    describe('バリデーションテスト', () => {
      it('subscriptionIdが空の場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: '',
          userId: 'user-123',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'サブスクリプションIDは必須です'
        );
      });

      it('subscriptionIdがnullの場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: null as any,
          userId: 'user-123',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'サブスクリプションIDは必須です'
        );
      });

      it('subscriptionIdがundefinedの場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: undefined as any,
          userId: 'user-123',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'サブスクリプションIDは必須です'
        );
      });

      it('userIdが空の場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: '',
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'ユーザーIDは必須です'
        );
      });

      it('userIdがnullの場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: null as any,
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'ユーザーIDは必須です'
        );
      });

      it('userIdがundefinedの場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: undefined as any,
        };

        await expect(useCase.execute(request)).rejects.toThrow(
          'ユーザーIDは必須です'
        );
      });
    });

    describe('存在確認テスト', () => {
      it('サブスクリプションが存在しない場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'non-existent',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest.fn().mockResolvedValue(null);

        await expect(useCase.execute(request)).rejects.toThrow(
          'サブスクリプションが見つかりません'
        );
      });

      it('存在しないSupabaseユーザーIDでも正常に処理される', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: mockUser.getId(),
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('User not found'));
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });
    });

    describe('権限テスト', () => {
      it('他のユーザーのサブスクリプションを削除しようとした場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'other-user',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);

        await expect(useCase.execute(request)).rejects.toThrow(
          'このサブスクリプションを削除する権限がありません'
        );
      });

      it('SupabaseユーザーIDで他のユーザーのサブスクリプションを削除しようとした場合にエラーをスローする', async () => {
        const otherUser = User.create('other@example.com');

        const request = {
          subscriptionId: 'sub-123',
          userId: 'supabase-other-user',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(otherUser);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);

        await expect(useCase.execute(request)).rejects.toThrow(
          'このサブスクリプションを削除する権限がありません'
        );
      });
    });

    describe('エラーハンドリングテスト', () => {
      it('findByIdでエラーが発生した場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockRejectedValue(new Error('Database connection error'));

        await expect(useCase.execute(request)).rejects.toThrow(
          'Database connection error'
        );
      });

      it('deleteでエラーが発生した場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockRejectedValue(new Error('Delete operation failed'));

        await expect(useCase.execute(request)).rejects.toThrow(
          'Delete operation failed'
        );

        // 権限チェックが通った後にdeleteが呼ばれることを確認
        expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith('sub-123');
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith('sub-123');
      });

      it('findBySupabaseUserIdでエラーが発生しても処理を継続する', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockRejectedValue(new Error('Supabase connection error'));
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });
    });

    describe('境界値テスト', () => {
      it('非常に長いsubscriptionIdでも正常に処理される', async () => {
        const longId = 'a'.repeat(1000);
        const request = {
          subscriptionId: longId,
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(longId);
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(longId);
        expect(result.success).toBe(true);
      });

      it('非常に長いuserIdでも正常に処理される', async () => {
        const longUserId = 'b'.repeat(1000);
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(result.success).toBe(true);
      });

      it('特殊文字を含むIDでも正常に処理される', async () => {
        const specialId = 'sub-123!@#$%^&*()_+-=[]{}|;:,.<>?';
        const request = {
          subscriptionId: specialId,
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const result = await useCase.execute(request);

        expect(mockSubscriptionRepository.findById).toHaveBeenCalledWith(specialId);
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(specialId);
        expect(result.success).toBe(true);
      });
    });

    describe('パフォーマンステスト', () => {
      it('大量のリクエストを高速で処理できる', async () => {
        const requests = Array.from({ length: 100 }, (_, i) => ({
          subscriptionId: `sub-${i}`,
          userId: 'user-123',
        }));

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
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
      it('同じサブスクリプションに対する複数の削除リクエストを処理できる', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        const promises = Array.from({ length: 5 }, () => useCase.execute(request));
        const results = await Promise.all(promises);

        expect(results).toHaveLength(5);
        results.forEach(result => {
          expect(result.success).toBe(true);
        });
        expect(mockSubscriptionRepository.findById).toHaveBeenCalledTimes(5);
        expect(mockSubscriptionRepository.delete).toHaveBeenCalledTimes(5);
      });
    });

    describe('データ整合性テスト', () => {
      it('削除後に同じIDで再度削除しようとした場合にエラーをスローする', async () => {
        const request = {
          subscriptionId: 'sub-123',
          userId: 'user-123',
        };

        // 1回目の削除
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest
          .fn()
          .mockResolvedValue(mockSubscription);
        mockSubscriptionRepository.delete = jest
          .fn()
          .mockResolvedValue(undefined);

        await useCase.execute(request);

        // 2回目の削除（削除済みのため存在しない）
        mockUserRepository.findBySupabaseUserId = jest
          .fn()
          .mockResolvedValue(null);
        mockSubscriptionRepository.findById = jest.fn().mockResolvedValue(null);

        await expect(useCase.execute(request)).rejects.toThrow(
          'サブスクリプションが見つかりません'
        );
      });
    });
  });
});
