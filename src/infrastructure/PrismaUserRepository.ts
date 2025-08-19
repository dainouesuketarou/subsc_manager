import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { User } from '../domain/entities/User';
import { Email } from '../domain/value-objects/Email';
import { prisma } from './utils/PrismaClient';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(userId: string): Promise<User> {
    const user = await this.prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return User.reconstitute({
      id: user.id,
      email: new Email(user.email),
      passwordHash: user.password_hash || undefined,
      supabaseUserId: user.supabase_user_id || undefined,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  }

  async findByEmail(email: Email): Promise<User> {
    const user = await this.prismaClient.user.findUnique({
      where: { email: email.value },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return User.reconstitute({
      id: user.id,
      email: new Email(user.email),
      passwordHash: user.password_hash || undefined,
      supabaseUserId: user.supabase_user_id || undefined,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  }

  async findBySupabaseUserId(supabaseUserId: string): Promise<User | null> {
    const user = await this.prismaClient.user.findUnique({
      where: { supabase_user_id: supabaseUserId },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute({
      id: user.id,
      email: new Email(user.email),
      passwordHash: user.password_hash || undefined,
      supabaseUserId: user.supabase_user_id || undefined,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  }

  async create(email: Email, passwordHash: string): Promise<void> {
    const user = User.createWithPassword(email.value, passwordHash);
    const dto = user.toDTO();

    const data = {
      id: dto.id,
      email: dto.email.value,
      password_hash: dto.passwordHash,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };

    await this.prismaClient.user.create({ data });
  }

  async createWithSupabaseUser(
    email: Email,
    supabaseUserId: string
  ): Promise<void> {
    const user = User.create(email.value, supabaseUserId);
    const dto = user.toDTO();

    const data = {
      id: dto.id,
      email: dto.email.value,
      password_hash: dto.passwordHash,
      supabase_user_id: supabaseUserId,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };

    await this.prismaClient.user.create({ data });
  }

  async update(userId: string, email: Email): Promise<void> {
    await this.prismaClient.user.update({
      where: { id: userId },
      data: {
        email: email.value,
        updated_at: new Date(),
      },
    });
  }

  async updateSupabaseUserId(
    userId: string,
    supabaseUserId: string
  ): Promise<void> {
    try {
      await this.prismaClient.user.update({
        where: { id: userId },
        data: {
          supabase_user_id: supabaseUserId,
          updated_at: new Date(),
        },
      });
    } catch (error) {
      console.warn('supabase_user_id field not available yet:', error);
    }
  }

  async delete(userId: string): Promise<void> {
    await this.prismaClient.user.delete({
      where: { id: userId },
    });
  }
}
