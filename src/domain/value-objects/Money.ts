export enum Currency {
  JPY = 'JPY',
  USD = 'USD',
  EUR = 'EUR',
}

export type Amount = number;

export class Money {
  public readonly amount: Amount;
  public readonly currency: Currency;

  constructor(amount: Amount, currency: Currency) {
    if (!Money.isValidAmount(amount)) {
      throw new Error(`金額は0以上である必要があります: ${amount}`);
    }
    if (!Money.isValidCurrency(currency)) {
      throw new Error(
        `無効な通貨です: ${currency}. 有効な通貨: ${Object.values(Currency).join(', ')}`
      );
    }
    this.amount = amount;
    this.currency = currency;
  }

  // ファクトリメソッドで安全な作成
  static create(amount: number, currency: string): Money {
    return new Money(amount, currency as Currency);
  }

  static isValidAmount(amount: number): amount is Amount {
    return amount >= 0;
  }

  static isValidCurrency(currency: string): currency is Currency {
    return Object.values(Currency).includes(currency as Currency);
  }
}
