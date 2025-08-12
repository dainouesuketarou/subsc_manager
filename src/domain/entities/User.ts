import { Email } from '../value-objects/Email';
import crypto from 'crypto';

export type UserDTO = {
  id: UserId;
  email: Email;
  passwordHash?: string;
  supabaseUserId?: string;
  createdAt: UserCreatedAt;
  updatedAt: Date;
};

export type UserId = string;
export type UserCreatedAt = Date;

export class User {
  private readonly id: UserId;
  private readonly email: Email;
  private readonly passwordHash?: string;
  private readonly supabaseUserId?: string;
  private readonly createdAt: UserCreatedAt;
  private readonly updatedAt: Date;

  constructor(
    id: UserId,
    email: Email,
    createdAt: UserCreatedAt,
    updatedAt: Date,
    passwordHash?: string,
    supabaseUserId?: string
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.supabaseUserId = supabaseUserId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(emailValue: string, supabaseUserId?: string): User {
    const email = new Email(emailValue);
    const now = new Date();
    const user = new User(
      crypto.randomUUID(),
      email,
      now,
      now,
      undefined,
      supabaseUserId
    );
    return user;
  }

  public static createWithPassword(
    emailValue: string,
    passwordHash: string
  ): User {
    const email = new Email(emailValue);
    const now = new Date();
    const user = new User(crypto.randomUUID(), email, now, now, passwordHash);
    return user;
  }

  public static reconstitute(dto: UserDTO): User {
    return new User(
      dto.id,
      dto.email,
      dto.createdAt,
      dto.updatedAt,
      dto.passwordHash,
      dto.supabaseUserId
    );
  }

  public toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      supabaseUserId: this.supabaseUserId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public getPasswordHash(): string | undefined {
    return this.passwordHash;
  }

  public getSupabaseUserId(): string | undefined {
    return this.supabaseUserId;
  }

  public getId(): string {
    return this.id;
  }

  public getEmail(): Email {
    return this.email;
  }
}
