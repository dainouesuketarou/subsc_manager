import { PrismaUserRepository } from '../../src/infrastructure/PrismaUserRepository';
import { PrismaClient } from '@prisma/client';
import { User } from '../../src/domain/entities/User';
import { Email } from '../../src/domain/value-objects/Email';

// PrismaClientのモック
jest.mock('@prisma/client');

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    repository = new PrismaUserRepository(mockPrisma);
  });

  describe('findById', () => {
    it('ユーザーが見つかった場合、Userオブジェクトを返す', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.findById('test-id');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.toDTO().id).toBe('test-id');
      expect(result.toDTO().email.value).toBe('test@example.com');
    });

    it('ユーザーが見つからない場合、エラーを投げる', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(repository.findById('non-existent-id')).rejects.toThrow(
        'User not found: non-existent-id'
      );
    });
  });

  describe('findByEmail', () => {
    it('メールアドレスでユーザーが見つかった場合、Userオブジェクトを返す', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const email = new Email('test@example.com');
      const result = await repository.findByEmail(email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.toDTO().id).toBe('test-id');
      expect(result.toDTO().email.value).toBe('test@example.com');
    });

    it('メールアドレスでユーザーが見つからない場合、エラーを投げる', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const email = new Email('nonexistent@example.com');
      await expect(repository.findByEmail(email)).rejects.toThrow(
        'User not found: nonexistent@example.com'
      );
    });
  });

  describe('create', () => {
    it('新しいユーザーを作成する', async () => {
      const email = new Email('newuser@example.com');
      mockPrisma.user.create = jest.fn().mockResolvedValue({});

      await repository.create(email, 'hashed-password');

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          password_hash: 'hashed-password',
        },
      });
    });
  });

  describe('update', () => {
    it('ユーザー情報を更新する', async () => {
      const userId = 'test-id';
      const newEmail = new Email('updated@example.com');
      mockPrisma.user.update = jest.fn().mockResolvedValue({});

      await repository.update(userId, newEmail);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { email: 'updated@example.com' },
      });
    });
  });

  describe('delete', () => {
    it('ユーザーを削除する', async () => {
      const userId = 'test-id';
      mockPrisma.user.delete = jest.fn().mockResolvedValue({});

      await repository.delete(userId);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
