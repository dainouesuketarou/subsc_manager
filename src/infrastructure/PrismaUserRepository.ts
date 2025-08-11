import { User, UserId } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { PrismaClient } from '@prisma/client';
import { Email } from '@/domain/value-objects/Email';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(userId: UserId): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return new User(
      user.id,
      new Email(user.email),
      user.password_hash,
      user.created_at,
      user.updated_at
    );
  }

  async findByEmail(email: Email): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!user) {
      throw new Error(`User not found: ${email.value}`);
    }

    return new User(
      user.id,
      new Email(user.email),
      user.password_hash,
      user.created_at,
      user.updated_at
    );
  }

  async create(email: Email, passwordHash: string): Promise<void> {
    await this.prisma.user.create({
      data: {
        email: email.value,
        password_hash: passwordHash,
      },
    });
  }

  async update(userId: UserId, email: Email): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: email.value },
    });
  }

  async delete(userId: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }
}
