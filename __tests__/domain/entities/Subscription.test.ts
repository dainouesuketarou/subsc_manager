import { Money } from '@/domain/value-objects/Money';
import { Subscription } from '../../../src/domain/entities/Subscription';
import { PaymentCycleValue } from '@/domain/value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '@/domain/value-objects/SubscriptionCategory';

describe('Subscription', () => {
  describe('toDTO', () => {
    it('サブスクリプションのDTOを取得できる', () => {
      const subscription = Subscription.create(
        'user-id',
        'subscription-name',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );
      const dto = subscription.toDTO();
      expect(dto.id).toBeDefined();
      expect(dto.userId).toBe('user-id');
      expect(dto.name).toBe('subscription-name');
      expect(dto.money.amount).toBe(1000);
      expect(dto.money.currency).toBe('JPY');
      expect(dto.paymentCycle.value).toBe('MONTHLY');
      expect(dto.category.getValue()).toBe('VIDEO_STREAMING');
    });
  });

  describe('reconstitute', () => {
    it('サブスクリプションのDTOを再構成できる', () => {
      const subscription = Subscription.create(
        'user-id',
        'subscription-name',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );
      const dto = subscription.toDTO();
      const reconstitutedSubscription = Subscription.reconstitute(dto);
      expect(reconstitutedSubscription.toDTO()).toEqual(dto);
    });
  });

  describe('create with paymentStartDate', () => {
    it('支払い開始日を指定してサブスクリプションを作成できる', () => {
      const paymentStartDate = new Date('2024-08-03');
      const subscription = Subscription.create(
        'user-id',
        'subscription-name',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING'),
        paymentStartDate
      );

      const dto = subscription.toDTO();
      expect(dto.paymentStartDate).toEqual(paymentStartDate);
    });

    it('支払い開始日を指定しない場合、現在の日付が設定される', () => {
      const beforeCreation = new Date();
      const subscription = Subscription.create(
        'user-id',
        'subscription-name',
        Money.create(1000, 'JPY'),
        PaymentCycleValue.create('MONTHLY'),
        SubscriptionCategoryValue.create('VIDEO_STREAMING')
      );
      const afterCreation = new Date();

      const dto = subscription.toDTO();
      expect(dto.paymentStartDate.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime()
      );
      expect(dto.paymentStartDate.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime()
      );
    });
  });
});
