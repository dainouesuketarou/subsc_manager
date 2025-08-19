import { ISubscriptionRepository } from '../../../src/domain/repositories/ISubscriptionRepository';
import {
  Subscription,
  SubscriptionId,
} from '../../../src/domain/entities/Subscription';
import { Money } from '../../../src/domain/value-objects/Money';
import { PaymentCycleValue } from '../../../src/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../../../src/domain/value-objects/SubscriptionCategory';

// モックの実装
class MockSubscriptionRepository implements ISubscriptionRepository {
  private subscriptions: Map<string, Subscription> = new Map();
  private subscriptionsByUserId: Map<string, Subscription[]> = new Map();

  async findByUserId(userId: string): Promise<Subscription[]> {
    return this.subscriptionsByUserId.get(userId) || [];
  }

  async findById(subscriptionId: SubscriptionId): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  async create(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();
    this.subscriptions.set(dto.id, subscription);

    const userSubscriptions = this.subscriptionsByUserId.get(dto.userId) || [];
    // 同じIDのサブスクリプションが既に存在する場合は置き換える
    const existingIndex = userSubscriptions.findIndex(
      sub => sub.toDTO().id === dto.id
    );
    if (existingIndex !== -1) {
      userSubscriptions[existingIndex] = subscription;
    } else {
      userSubscriptions.push(subscription);
    }
    this.subscriptionsByUserId.set(dto.userId, userSubscriptions);
  }

  async update(subscription: Subscription): Promise<void> {
    const dto = subscription.toDTO();
    const existingSubscription = this.subscriptions.get(dto.id);
    if (!existingSubscription) {
      throw new Error(`Subscription not found with id: ${dto.id}`);
    }

    this.subscriptions.set(dto.id, subscription);

    // ユーザー別のリストも更新
    const userSubscriptions = this.subscriptionsByUserId.get(dto.userId) || [];
    const index = userSubscriptions.findIndex(sub => sub.toDTO().id === dto.id);
    if (index !== -1) {
      userSubscriptions[index] = subscription;
      this.subscriptionsByUserId.set(dto.userId, userSubscriptions);
    }
  }

  async delete(subscriptionId: SubscriptionId): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found with id: ${subscriptionId}`);
    }

    const dto = subscription.toDTO();
    this.subscriptions.delete(subscriptionId);

    // ユーザー別のリストからも削除
    const userSubscriptions = this.subscriptionsByUserId.get(dto.userId) || [];
    const filteredSubscriptions = userSubscriptions.filter(
      sub => sub.toDTO().id !== subscriptionId
    );
    this.subscriptionsByUserId.set(dto.userId, filteredSubscriptions);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.subscriptions.clear();
    this.subscriptionsByUserId.clear();
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getUserSubscriptionCount(userId: string): number {
    return this.subscriptionsByUserId.get(userId)?.length || 0;
  }
}

describe('ISubscriptionRepository', () => {
  let repository: MockSubscriptionRepository;
  let testUserId: string;
  let testSubscription: Subscription;

  beforeEach(() => {
    repository = new MockSubscriptionRepository();
    testUserId = 'user-123';
    testSubscription = Subscription.create(
      testUserId,
      'Netflix',
      Money.create(1000, 'JPY'),
      PaymentCycleValue.create('MONTHLY'),
      SubscriptionCategoryValue.create('VIDEO_STREAMING')
    );
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('正常なサブスクリプションを作成できる', async () => {
      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);
      expect(repository.getUserSubscriptionCount(testUserId)).toBe(1);
    });

    it('同じユーザーの複数のサブスクリプションを作成できる', async () => {
      const subscription1 = Subscription.create(
        testUserId,
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      const subscription2 = Subscription.create(
        testUserId,
        'Spotify',
        Money.create(500, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('MUSIC_STREAMING')
      );

      await repository.create(subscription1);
      await repository.create(subscription2);

      expect(repository.getSubscriptionCount()).toBe(2);
      expect(repository.getUserSubscriptionCount(testUserId)).toBe(2);
    });

    it('異なるユーザーのサブスクリプションを作成できる', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      const subscription1 = Subscription.create(
        user1Id,
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      const subscription2 = Subscription.create(
        user2Id,
        'Spotify',
        Money.create(500, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('MUSIC_STREAMING')
      );

      await repository.create(subscription1);
      await repository.create(subscription2);

      expect(repository.getSubscriptionCount()).toBe(2);
      expect(repository.getUserSubscriptionCount(user1Id)).toBe(1);
      expect(repository.getUserSubscriptionCount(user2Id)).toBe(1);
    });

    it('同じIDのサブスクリプションを上書きできる', async () => {
      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);

      // 同じIDで新しいサブスクリプションを作成
      const updatedSubscription = Subscription.reconstitute({
        ...testSubscription.toDTO(),
        name: 'Netflix Updated',
        money: Money.create(1200, 'JPY'),
      });

      await repository.create(updatedSubscription);
      expect(repository.getSubscriptionCount()).toBe(1); // 上書きされる
    });
  });

  describe('findByUserId', () => {
    it('存在するユーザーIDでサブスクリプションを取得できる', async () => {
      await repository.create(testSubscription);

      const subscriptions = await repository.findByUserId(testUserId);
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0]).toBeInstanceOf(Subscription);
      expect(subscriptions[0].toDTO().userId).toBe(testUserId);
    });

    it('存在しないユーザーIDで空配列を返す', async () => {
      const subscriptions = await repository.findByUserId('non-existent-user');
      expect(subscriptions).toHaveLength(0);
    });

    it('空文字列のユーザーIDで空配列を返す', async () => {
      const subscriptions = await repository.findByUserId('');
      expect(subscriptions).toHaveLength(0);
    });

    it('nullのユーザーIDで空配列を返す', async () => {
      const subscriptions = await repository.findByUserId(null as any);
      expect(subscriptions).toHaveLength(0);
    });

    it('undefinedのユーザーIDで空配列を返す', async () => {
      const subscriptions = await repository.findByUserId(undefined as any);
      expect(subscriptions).toHaveLength(0);
    });

    it('複数のサブスクリプションを正しい順序で取得できる', async () => {
      const subscription1 = Subscription.create(
        testUserId,
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      const subscription2 = Subscription.create(
        testUserId,
        'Spotify',
        Money.create(500, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('MUSIC_STREAMING')
      );

      await repository.create(subscription1);
      await repository.create(subscription2);

      const subscriptions = await repository.findByUserId(testUserId);
      expect(subscriptions).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('存在するサブスクリプションIDでサブスクリプションを取得できる', async () => {
      await repository.create(testSubscription);
      const subscriptionId = testSubscription.toDTO().id;

      const foundSubscription = await repository.findById(subscriptionId);
      expect(foundSubscription).toBeInstanceOf(Subscription);
      expect(foundSubscription?.toDTO().id).toBe(subscriptionId);
    });

    it('存在しないサブスクリプションIDでnullを返す', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeNull();
    });

    it('空文字列のサブスクリプションIDでnullを返す', async () => {
      const result = await repository.findById('');
      expect(result).toBeNull();
    });

    it('nullのサブスクリプションIDでnullを返す', async () => {
      const result = await repository.findById(null as any);
      expect(result).toBeNull();
    });

    it('undefinedのサブスクリプションIDでnullを返す', async () => {
      const result = await repository.findById(undefined as any);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('存在するサブスクリプションを更新できる', async () => {
      await repository.create(testSubscription);
      const subscriptionId = testSubscription.toDTO().id;

      const updatedSubscription = Subscription.reconstitute({
        ...testSubscription.toDTO(),
        name: 'Netflix Updated',
        money: Money.create(1200, 'JPY'),
      });

      await repository.update(updatedSubscription);

      const foundSubscription = await repository.findById(subscriptionId);
      expect(foundSubscription?.toDTO().name).toBe('Netflix Updated');
      expect(foundSubscription?.toDTO().money.amount).toBe(1200);
    });

    it('存在しないサブスクリプションIDで更新時にエラーを投げる', async () => {
      const nonExistentSubscription = Subscription.create(
        testUserId,
        'Non Existent',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      await expect(repository.update(nonExistentSubscription)).rejects.toThrow(
        'Subscription not found with id:'
      );
    });

    it('更新後もユーザー別のリストが正しく維持される', async () => {
      await repository.create(testSubscription);
      const subscriptionId = testSubscription.toDTO().id;

      const updatedSubscription = Subscription.reconstitute({
        ...testSubscription.toDTO(),
        name: 'Netflix Updated',
        money: Money.create(1200, 'JPY'),
      });

      await repository.update(updatedSubscription);

      const userSubscriptions = await repository.findByUserId(testUserId);
      expect(userSubscriptions).toHaveLength(1);
      expect(userSubscriptions[0].toDTO().name).toBe('Netflix Updated');
    });
  });

  describe('delete', () => {
    it('存在するサブスクリプションを削除できる', async () => {
      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);

      const subscriptionId = testSubscription.toDTO().id;
      await repository.delete(subscriptionId);

      expect(repository.getSubscriptionCount()).toBe(0);
      expect(repository.getUserSubscriptionCount(testUserId)).toBe(0);
    });

    it('存在しないサブスクリプションIDで削除時にエラーを投げる', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow(
        'Subscription not found with id: non-existent-id'
      );
    });

    it('削除後に同じIDで検索するとnullを返す', async () => {
      await repository.create(testSubscription);
      const subscriptionId = testSubscription.toDTO().id;

      await repository.delete(subscriptionId);

      const result = await repository.findById(subscriptionId);
      expect(result).toBeNull();
    });

    it('削除後も他のユーザーのサブスクリプションは影響を受けない', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      const subscription1 = Subscription.create(
        user1Id,
        'Netflix',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      const subscription2 = Subscription.create(
        user2Id,
        'Spotify',
        Money.create(500, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('MUSIC_STREAMING')
      );

      await repository.create(subscription1);
      await repository.create(subscription2);

      const subscription1Id = subscription1.toDTO().id;
      await repository.delete(subscription1Id);

      expect(repository.getSubscriptionCount()).toBe(1);
      expect(repository.getUserSubscriptionCount(user1Id)).toBe(0);
      expect(repository.getUserSubscriptionCount(user2Id)).toBe(1);
    });
  });

  describe('Repository behavior', () => {
    it('複数のユーザーの複数のサブスクリプションを管理できる', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      const subscriptions = [
        Subscription.create(
          user1Id,
          'Netflix',
          Money.create(1000, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        ),
        Subscription.create(
          user1Id,
          'Spotify',
          Money.create(500, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('MUSIC_STREAMING')
        ),
        Subscription.create(
          user2Id,
          'Amazon Prime',
          Money.create(800, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        ),
        Subscription.create(
          user2Id,
          'YouTube Premium',
          Money.create(600, 'JPY'),
          PaymentCycleValue.create('MONTHLY'),
          SubscriptionCategoryValue.create('VIDEO_STREAMING')
        ),
      ];

      for (const subscription of subscriptions) {
        await repository.create(subscription);
      }

      expect(repository.getSubscriptionCount()).toBe(4);
      expect(repository.getUserSubscriptionCount(user1Id)).toBe(2);
      expect(repository.getUserSubscriptionCount(user2Id)).toBe(2);
    });

    it('クリア後にサブスクリプションが存在しない', async () => {
      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);

      repository.clear();
      expect(repository.getSubscriptionCount()).toBe(0);
      expect(repository.getUserSubscriptionCount(testUserId)).toBe(0);
    });

    it('同じサブスクリプションを複数回作成・削除できる', async () => {
      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);

      const subscriptionId = testSubscription.toDTO().id;
      await repository.delete(subscriptionId);
      expect(repository.getSubscriptionCount()).toBe(0);

      await repository.create(testSubscription);
      expect(repository.getSubscriptionCount()).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('非常に長いユーザーIDでサブスクリプションを管理できる', async () => {
      const longUserId = 'A'.repeat(1000);
      const subscription = Subscription.create(
        longUserId,
        'Test Service',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      await repository.create(subscription);
      expect(repository.getSubscriptionCount()).toBe(1);
      expect(repository.getUserSubscriptionCount(longUserId)).toBe(1);
    });

    it('特殊文字を含むユーザーIDでサブスクリプションを管理できる', async () => {
      const specialUserId = 'user-123; DROP TABLE subscriptions; --';
      const subscription = Subscription.create(
        specialUserId,
        'Test Service',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      await repository.create(subscription);
      expect(repository.getSubscriptionCount()).toBe(1);
      expect(repository.getUserSubscriptionCount(specialUserId)).toBe(1);
    });

    it('Unicode文字を含むユーザーIDでサブスクリプションを管理できる', async () => {
      const unicodeUserId = 'ユーザー-123🎬';
      const subscription = Subscription.create(
        unicodeUserId,
        'Test Service',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );

      await repository.create(subscription);
      expect(repository.getSubscriptionCount()).toBe(1);
      expect(repository.getUserSubscriptionCount(unicodeUserId)).toBe(1);
    });
  });
});
