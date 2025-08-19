import { Money, Currency } from '../../../src/domain/value-objects/Money';

describe('Money', () => {
  describe('create', () => {
    it('正常な値でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(1000, 'JPY');
      expect(money.amount).toBe(1000);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('全ての有効な通貨でMoneyオブジェクトを作成できる', () => {
      const jpy = Money.create(1000, 'JPY');
      const usd = Money.create(10.5, 'USD');
      const eur = Money.create(8.75, 'EUR');

      expect(jpy.currency).toBe(Currency.JPY);
      expect(usd.currency).toBe(Currency.USD);
      expect(eur.currency).toBe(Currency.EUR);
    });

    it('ゼロの金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(0, 'JPY');
      expect(money.amount).toBe(0);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('負の金額でエラーを投げる', () => {
      expect(() => Money.create(-1000, 'JPY')).toThrow(
        '金額は0以上である必要があります: -1000'
      );
    });

    it('小数点を含む金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(1000.5, 'USD');
      expect(money.amount).toBe(1000.5);
      expect(money.currency).toBe(Currency.USD);
    });

    it('非常に大きな金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(Number.MAX_SAFE_INTEGER, 'JPY');
      expect(money.amount).toBe(Number.MAX_SAFE_INTEGER);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('非常に小さな金額でエラーを投げる', () => {
      expect(() => Money.create(Number.MIN_SAFE_INTEGER, 'JPY')).toThrow(
        '金額は0以上である必要があります: -9007199254740991'
      );
    });

    it('無効な通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, 'INVALID')).toThrow(
        '無効な通貨です: INVALID. 有効な通貨: JPY, USD, EUR'
      );
    });

    it('大文字小文字が混在した通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, 'jpy')).toThrow(
        '無効な通貨です: jpy. 有効な通貨: JPY, USD, EUR'
      );
    });

    it('空文字列の通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, '')).toThrow(
        '無効な通貨です: . 有効な通貨: JPY, USD, EUR'
      );
    });

    it('nullの通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, null as any)).toThrow(
        '無効な通貨です: null. 有効な通貨: JPY, USD, EUR'
      );
    });

    it('undefinedの通貨でエラーを投げる', () => {
      expect(() => Money.create(1000, undefined as any)).toThrow(
        '無効な通貨です: undefined. 有効な通貨: JPY, USD, EUR'
      );
    });
  });

  describe('Currency enum', () => {
    it('全ての通貨が定義されている', () => {
      expect(Currency.JPY).toBe('JPY');
      expect(Currency.USD).toBe('USD');
      expect(Currency.EUR).toBe('EUR');
    });

    it('全ての通貨が一意である', () => {
      const currencies = Object.values(Currency);
      const uniqueCurrencies = new Set(currencies);
      expect(uniqueCurrencies.size).toBe(currencies.length);
    });
  });

  describe('Money properties', () => {
    it('プロパティが正しい値を返す', () => {
      const money = Money.create(1500.75, 'USD');
      expect(money.amount).toBe(1500.75);
      expect(money.currency).toBe(Currency.USD);
    });
  });

  describe('Money equality', () => {
    it('同じ値を持つMoneyオブジェクトが等しい', () => {
      const money1 = Money.create(1000, 'JPY');
      const money2 = Money.create(1000, 'JPY');
      expect(money1.amount).toBe(money2.amount);
      expect(money1.currency).toBe(money2.currency);
    });

    it('異なる金額のMoneyオブジェクトが等しくない', () => {
      const money1 = Money.create(1000, 'JPY');
      const money2 = Money.create(2000, 'JPY');
      expect(money1.amount).not.toBe(money2.amount);
    });

    it('異なる通貨のMoneyオブジェクトが等しくない', () => {
      const money1 = Money.create(1000, 'JPY');
      const money2 = Money.create(1000, 'USD');
      expect(money1.currency).not.toBe(money2.currency);
    });
  });

  describe('Money edge cases', () => {
    it('NaNの金額でエラーを投げる', () => {
      expect(() => Money.create(NaN, 'JPY')).toThrow(
        '金額は0以上である必要があります: NaN'
      );
    });

    it('Infinityの金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(Infinity, 'JPY');
      expect(money.amount).toBe(Infinity);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('-Infinityの金額でエラーを投げる', () => {
      expect(() => Money.create(-Infinity, 'JPY')).toThrow(
        '金額は0以上である必要があります: -Infinity'
      );
    });

    it('数値以外の金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create('1000' as any, 'JPY');
      expect(money.amount).toBe('1000');
      expect(money.currency).toBe(Currency.JPY);
    });
  });

  describe('Money with special values', () => {
    it('nullの金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(null as any, 'JPY');
      expect(money.amount).toBeNull();
      expect(money.currency).toBe(Currency.JPY);
    });

    it('undefinedの金額でエラーを投げる', () => {
      expect(() => Money.create(undefined as any, 'JPY')).toThrow(
        '金額は0以上である必要があります: undefined'
      );
    });

    it('booleanの金額でMoneyオブジェクトを作成できる', () => {
      const money = Money.create(true as any, 'JPY');
      expect(money.amount).toBe(true);
      expect(money.currency).toBe(Currency.JPY);
    });

    it('オブジェクトの金額でエラーを投げる', () => {
      expect(() => Money.create({} as any, 'JPY')).toThrow(
        '金額は0以上である必要があります: [object Object]'
      );
    });
  });
});
