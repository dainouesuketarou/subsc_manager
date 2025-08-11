import { Money, Currency } from '../../../src/domain/value-objects/Money';

describe('Money', () => {
  describe('create', () => {
    it('正常な値でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(1000, 'JPY');
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('無効な通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, 'INVALID')).toThrow(
        '無効な通貨です: INVALID. 有効な通貨: JPY, USD, EUR'
      );
    });
  });
});
