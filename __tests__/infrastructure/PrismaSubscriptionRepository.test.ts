import { PrismaSubscriptionRepository } from '../../src/infrastructure/PrismaSubscriptionRepository';
import { PrismaClient } from '@prisma/client';
import { Subscription } from '../../src/domain/entities/Subscription';
import { Money } from '../../src/domain/value-objects/Money';
import { PaymentCycleValue } from '../../src/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../src/domain/value-objects/SubscriptionCategory';

// PrismaClientのモック
jest.mock('@prisma/client');

describe('PrismaSubscriptionRepository', () => {
  let repository: PrismaSubscriptionRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      subscription: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    repository = new PrismaSubscriptionRepository(mockPrisma);
  });

  describe('create', () => {
    it('新しいサブスクリプションを作成する', async () => {
      const subscription = Subscription.create(
        'test-user-id',
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      mockPrisma.subscription.create = jest.fn().mockResolvedValue({});

      await repository.create(subscription);

      const dto = subscription.toDTO();
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: {
          id: dto.id,
          user_id: dto.userId,
          name: dto.name,
          price: dto.money.amount,
          currency: dto.money.currency,
          payment_cycle: dto.paymentCycle.value,
          category: dto.category.getValue(),
          payment_start_date: dto.paymentStartDate,
          subscribed_at: dto.subscribedAt,
          updated_at: dto.updated_at,
        },
      });
    });

    it('支払い開始日を指定してサブスクリプションを作成する', async () => {
      const paymentStartDate = new Date('2024-08-03');
      const subscription = Subscription.create(
        'test-user-id',
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING'),
        paymentStartDate
      );

      mockPrisma.subscription.create = jest.fn().mockResolvedValue({});

      await repository.create(subscription);

      const dto = subscription.toDTO();
      expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
        data: {
          id: dto.id,
          user_id: dto.userId,
          name: dto.name,
          price: dto.money.amount,
          currency: dto.money.currency,
          payment_cycle: dto.paymentCycle.value,
          category: dto.category.getValue(),
          payment_start_date: paymentStartDate,
          subscribed_at: dto.subscribedAt,
          updated_at: dto.updated_at,
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('ユーザーIDでサブスクリプション一覧を取得する', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          user_id: 'user-1',
          name: 'Netflix',
          price: 1000,
          currency: 'JPY',
          payment_cycle: 'MONTHLY',
          category: 'VIDEO_STREAMING',
          payment_start_date: new Date('2024-01-01'),
          subscribed_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
        {
          id: 'sub-2',
          user_id: 'user-1',
          name: 'Spotify',
          price: 500,
          currency: 'JPY',
          payment_cycle: 'MONTHLY',
          category: 'MUSIC_STREAMING',
          payment_start_date: new Date('2024-01-01'),
          subscribed_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      mockPrisma.subscription.findMany = jest
        .fn()
        .mockResolvedValue(mockSubscriptions);

      const result = await repository.findByUserId('user-1');

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Subscription);
      expect(result[1]).toBeInstanceOf(Subscription);
      expect(result[0].toDTO().name).toBe('Netflix');
      expect(result[1].toDTO().name).toBe('Spotify');
    });

    it('ユーザーにサブスクリプションが存在しない場合、空配列を返す', async () => {
      mockPrisma.subscription.findMany = jest.fn().mockResolvedValue([]);

      const result = await repository.findByUserId('user-with-no-subs');

      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-with-no-subs' },
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('サブスクリプション情報を更新する', async () => {
      const subscription = Subscription.create(
        'test-user-id',
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      mockPrisma.subscription.update = jest.fn().mockResolvedValue({});

      await repository.update(subscription);

      const dto = subscription.toDTO();
      expect(mockPrisma.subscription.update).toHaveBeenCalledWith({
        where: { id: dto.id },
        data: {
          name: dto.name,
          price: dto.money.amount,
          currency: dto.money.currency,
          payment_cycle: dto.paymentCycle.value,
          category: dto.category.getValue(),
          payment_start_date: dto.paymentStartDate,
          updated_at: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    it('サブスクリプションを削除する', async () => {
      const subscriptionId = 'sub-1';
      mockPrisma.subscription.delete = jest.fn().mockResolvedValue({});

      await repository.delete(subscriptionId);

      expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
        where: { id: subscriptionId },
      });
    });
  });
});
