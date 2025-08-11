import { Email } from '../value-objects/Email';

export type UserDTO = {
  id: UserId;
  email: Email;
  passwordHash: string;
  createdAt: UserCreatedAt;
  updatedAt: Date;
};

export type UserId = string;
export type UserCreatedAt = Date;

export class User {
  private readonly id: UserId;
  private readonly email: Email;
  private readonly passwordHash: string;
  private readonly createdAt: UserCreatedAt;
  private readonly updatedAt: Date;

  constructor(
    id: UserId,
    email: Email,
    passwordHash: string,
    createdAt: UserCreatedAt,
    updatedAt: Date
  ) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static create(emailValue: string, passwordHash: string): User {
    const email = new Email(emailValue);
    const now = new Date();
    const user = new User(crypto.randomUUID(), email, passwordHash, now, now);
    return user;
  }

  public static reconstitute(dto: UserDTO): User {
    return new User(
      dto.id,
      dto.email,
      dto.passwordHash,
      dto.createdAt,
      dto.updatedAt
    );
  }

  public toDTO(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public getPasswordHash(): string {
    return this.passwordHash;
  }
}
