import { Money } from '../value-objects/Money';
import { PaymentCycleValue } from '../value-objects/PaymentCycle';
import { SubscriptionCategoryValue } from '../value-objects/SubscriptionCategory';
import { UserId } from './User';
import crypto from 'crypto';

export type SubscriptionDTO = {
  id: SubscriptionId;
  userId: UserId;
  name: SubscriptionName;
  money: Money;
  paymentCycle: PaymentCycleValue;
  category: SubscriptionCategoryValue;
  paymentStartDate: SubscriptionPaymentStartDate;
  subscribedAt: SubscriptionSubscribedAt;
  updatedAt: SubscriptionUpdatedAt;
};

export type SubscriptionId = string;
export type SubscriptionName = string;
export type SubscriptionPaymentStartDate = Date;
export type SubscriptionSubscribedAt = Date;
export type SubscriptionUpdatedAt = Date;

export class Subscription {
  private readonly id: SubscriptionId;
  private readonly userId: UserId;
  private readonly name: SubscriptionName;
  private readonly money: Money;
  private readonly paymentCycle: PaymentCycleValue;
  private readonly category: SubscriptionCategoryValue;
  private readonly paymentStartDate: SubscriptionPaymentStartDate;
  private readonly subscribedAt: SubscriptionSubscribedAt;
  private readonly updatedAt: SubscriptionUpdatedAt;

  constructor(
    id: SubscriptionId,
    userId: UserId,
    name: SubscriptionName,
    money: Money,
    paymentCycle: PaymentCycleValue,
    category: SubscriptionCategoryValue,
    paymentStartDate: SubscriptionPaymentStartDate,
    subscribedAt: SubscriptionSubscribedAt,
    updatedAt: SubscriptionUpdatedAt
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.money = money;
    this.paymentCycle = paymentCycle;
    this.category = category;
    this.paymentStartDate = paymentStartDate;
    this.subscribedAt = subscribedAt;
    this.updatedAt = updatedAt;
  }

  public static reconstitute(props: SubscriptionDTO): Subscription {
    return new Subscription(
      props.id,
      props.userId,
      props.name,
      props.money,
      props.paymentCycle,
      props.category,
      props.paymentStartDate,
      props.subscribedAt,
      props.updatedAt
    );
  }

  public toDTO(): SubscriptionDTO {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      money: this.money,
      paymentCycle: this.paymentCycle,
      category: this.category,
      paymentStartDate: this.paymentStartDate,
      subscribedAt: this.subscribedAt,
      updatedAt: this.updatedAt,
    };
  }

  public static create(
    userId: UserId,
    name: SubscriptionName,
    money: Money,
    paymentCycle: PaymentCycleValue,
    category: SubscriptionCategoryValue,
    paymentStartDate?: SubscriptionPaymentStartDate
  ): Subscription {
    return new Subscription(
      crypto.randomUUID(),
      userId,
      name,
      money,
      paymentCycle,
      category,
      paymentStartDate || new Date(),
      new Date(),
      new Date()
    );
  }
}
