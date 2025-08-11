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
      throw new Error('Amount must be positive');
    }
    if (!Money.isValidCurrency(currency)) {
      throw new Error(`Invalid currency: ${currency}`);
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
    // Object.values(Currency) は Currency 型の配列を返す -> 'JPY' | 'USD' | 'EUR'
    // .includes(currency as Currency) は currency が Currency 型の配列に含まれているかどうかをチェック
    return Object.values(Currency).includes(currency as Currency);
  }
}
