import {
  PaymentCycle,
  PaymentCycleValue,
} from '../../../src/domain/value-objects/PaymentCycle';

describe('PaymentCycle', () => {
  describe('PaymentCycle enum', () => {
    it('全ての支払いサイクルが定義されている', () => {
      expect(PaymentCycle.DAILY).toBe('DAILY');
      expect(PaymentCycle.MONTHLY).toBe('MONTHLY');
      expect(PaymentCycle.SEMI_ANNUALLY).toBe('SEMI_ANNUALLY');
      expect(PaymentCycle.ANNUALLY).toBe('ANNUALLY');
    });

    it('全ての支払いサイクルが一意である', () => {
      const cycles = Object.values(PaymentCycle);
      const uniqueCycles = new Set(cycles);
      expect(uniqueCycles.size).toBe(cycles.length);
    });
  });

  describe('PaymentCycleValue constructor', () => {
    it('正常な支払いサイクルでPaymentCycleValueを作成できる', () => {
      const cycleValue = new PaymentCycleValue(PaymentCycle.MONTHLY);
      expect(cycleValue.value).toBe(PaymentCycle.MONTHLY);
    });

    it('無効な支払いサイクルでエラーを投げる', () => {
      expect(() => new PaymentCycleValue('INVALID' as PaymentCycle)).toThrow(
        'Invalid payment cycle: INVALID'
      );
    });

    it('空文字列でエラーを投げる', () => {
      expect(() => new PaymentCycleValue('' as PaymentCycle)).toThrow(
        'Invalid payment cycle: '
      );
    });

    it('nullでエラーを投げる', () => {
      expect(() => new PaymentCycleValue(null as any)).toThrow(
        'Invalid payment cycle: null'
      );
    });

    it('undefinedでエラーを投げる', () => {
      expect(() => new PaymentCycleValue(undefined as any)).toThrow(
        'Invalid payment cycle: undefined'
      );
    });
  });

  describe('PaymentCycleValue.create', () => {
    it('正常な文字列でPaymentCycleValueを作成できる', () => {
      const cycleValue = PaymentCycleValue.create('MONTHLY');
      expect(cycleValue.value).toBe(PaymentCycle.MONTHLY);
    });

    it('全ての有効な支払いサイクルで作成できる', () => {
      const daily = PaymentCycleValue.create('DAILY');
      const monthly = PaymentCycleValue.create('MONTHLY');
      const semiAnnually = PaymentCycleValue.create('SEMI_ANNUALLY');
      const annually = PaymentCycleValue.create('ANNUALLY');

      expect(daily.value).toBe(PaymentCycle.DAILY);
      expect(monthly.value).toBe(PaymentCycle.MONTHLY);
      expect(semiAnnually.value).toBe(PaymentCycle.SEMI_ANNUALLY);
      expect(annually.value).toBe(PaymentCycle.ANNUALLY);
    });

    it('大文字小文字が混在した文字列でエラーを投げる', () => {
      expect(() => PaymentCycleValue.create('Monthly')).toThrow(
        'Invalid payment cycle: Monthly'
      );
    });

    it('無効な文字列でエラーを投げる', () => {
      expect(() => PaymentCycleValue.create('WEEKLY')).toThrow(
        'Invalid payment cycle: WEEKLY'
      );
    });

    it('空文字列でエラーを投げる', () => {
      expect(() => PaymentCycleValue.create('')).toThrow(
        'Invalid payment cycle: '
      );
    });

    it('nullでエラーを投げる', () => {
      expect(() => PaymentCycleValue.create(null as any)).toThrow(
        'Invalid payment cycle: null'
      );
    });

    it('undefinedでエラーを投げる', () => {
      expect(() => PaymentCycleValue.create(undefined as any)).toThrow(
        'Invalid payment cycle: undefined'
      );
    });
  });

  describe('PaymentCycleValue.isValidPaymentCycle', () => {
    it('有効な支払いサイクルでtrueを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle('DAILY')).toBe(true);
      expect(PaymentCycleValue.isValidPaymentCycle('MONTHLY')).toBe(true);
      expect(PaymentCycleValue.isValidPaymentCycle('SEMI_ANNUALLY')).toBe(true);
      expect(PaymentCycleValue.isValidPaymentCycle('ANNUALLY')).toBe(true);
    });

    it('無効な支払いサイクルでfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle('WEEKLY')).toBe(false);
      expect(PaymentCycleValue.isValidPaymentCycle('QUARTERLY')).toBe(false);
      expect(PaymentCycleValue.isValidPaymentCycle('INVALID')).toBe(false);
    });

    it('空文字列でfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle('')).toBe(false);
    });

    it('nullでfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle(null as any)).toBe(false);
    });

    it('undefinedでfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle(undefined as any)).toBe(
        false
      );
    });

    it('大文字小文字が混在した文字列でfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle('Monthly')).toBe(false);
      expect(PaymentCycleValue.isValidPaymentCycle('monthly')).toBe(false);
    });

    it('数値でfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle(1 as any)).toBe(false);
      expect(PaymentCycleValue.isValidPaymentCycle(0 as any)).toBe(false);
    });

    it('オブジェクトでfalseを返す', () => {
      expect(PaymentCycleValue.isValidPaymentCycle({} as any)).toBe(false);
      expect(PaymentCycleValue.isValidPaymentCycle([] as any)).toBe(false);
    });
  });

  describe('PaymentCycleValue value property', () => {
    it('valueプロパティが正しい値を返す', () => {
      const cycleValue = new PaymentCycleValue(PaymentCycle.ANNUALLY);
      expect(cycleValue.value).toBe(PaymentCycle.ANNUALLY);
    });
  });

  describe('PaymentCycleValue equality', () => {
    it('同じ値を持つPaymentCycleValueが等しい', () => {
      const cycle1 = new PaymentCycleValue(PaymentCycle.MONTHLY);
      const cycle2 = new PaymentCycleValue(PaymentCycle.MONTHLY);
      expect(cycle1.value).toBe(cycle2.value);
    });

    it('異なる値を持つPaymentCycleValueが等しくない', () => {
      const cycle1 = new PaymentCycleValue(PaymentCycle.MONTHLY);
      const cycle2 = new PaymentCycleValue(PaymentCycle.ANNUALLY);
      expect(cycle1.value).not.toBe(cycle2.value);
    });
  });
});
