export enum PaymentCycle {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
}

export class PaymentCycleValue {
  public readonly value: PaymentCycle;

  constructor(value: PaymentCycle) {
    if (!Object.values(PaymentCycle).includes(value)) {
      throw new Error(`Invalid payment cycle: ${value}`);
    }
    this.value = value;
  }

  // ファクトリメソッドで安全な作成
  static create(cycle: string): PaymentCycleValue {
    if (!Object.values(PaymentCycle).includes(cycle as PaymentCycle)) {
      throw new Error(`Invalid payment cycle: ${cycle}`);
    }
    return new PaymentCycleValue(cycle as PaymentCycle);
  }

  // バリデーション関数
  static isValidPaymentCycle(cycle: string): cycle is PaymentCycle {
    return Object.values(PaymentCycle).includes(cycle as PaymentCycle);
  }
}
