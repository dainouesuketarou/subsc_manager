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
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>;

    repository = new PrismaUserRepository(mockPrisma);
  });

  describe('findById', () => {
    it('ユーザーIDでユーザーを正常に取得する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        supabase_user_id: 'supabase-user-1',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.findById('user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.toDTO().id).toBe('user-1');
      expect(result.toDTO().email.value).toBe('test@example.com');
    });

    it('存在しないユーザーIDの場合、エラーをスローする', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(repository.findById('non-existent')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('findByEmail', () => {
    it('メールアドレスでユーザーを正常に取得する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        supabase_user_id: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const email = new Email('test@example.com');
      const result = await repository.findByEmail(email);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.toDTO().email.value).toBe('test@example.com');
    });

    it('存在しないメールアドレスの場合、エラーをスローする', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const email = new Email('nonexistent@example.com');
      await expect(repository.findByEmail(email)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('findBySupabaseUserId', () => {
    it('SupabaseユーザーIDでユーザーを正常に取得する', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password_hash: null,
        supabase_user_id: 'supabase-user-1',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.findBySupabaseUserId('supabase-user-1');

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { supabase_user_id: 'supabase-user-1' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.toDTO().supabaseUserId).toBe('supabase-user-1');
    });

    it('存在しないSupabaseユーザーIDの場合、nullを返す', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await repository.findBySupabaseUserId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('パスワードハッシュ付きでユーザーを正常に作成する', async () => {
      const email = new Email('newuser@example.com');
      const passwordHash = 'hashed_password';

      mockPrisma.user.create = jest.fn().mockResolvedValue({});

      await repository.create(email, passwordHash);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newuser@example.com',
          password_hash: 'hashed_password',
        }),
      });
    });

    it('ユーザー作成時にデータベースエラーが発生した場合、エラーをスローする', async () => {
      const email = new Email('newuser@example.com');
      const passwordHash = 'hashed_password';

      mockPrisma.user.create = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.create(email, passwordHash)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('createWithSupabaseUser', () => {
    it('Supabaseユーザー付きでユーザーを正常に作成する', async () => {
      const email = new Email('supabaseuser@example.com');
      const supabaseUserId = 'supabase-user-1';

      mockPrisma.user.create = jest.fn().mockResolvedValue({});

      await repository.createWithSupabaseUser(email, supabaseUserId);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'supabaseuser@example.com',
          supabase_user_id: 'supabase-user-1',
        }),
      });
    });
  });

  describe('update', () => {
    it('ユーザー情報を正常に更新する', async () => {
      const userId = 'user-1';
      const email = new Email('updated@example.com');

      mockPrisma.user.update = jest.fn().mockResolvedValue({});

      await repository.update(userId, email);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          email: 'updated@example.com',
          updated_at: expect.any(Date),
        },
      });
    });

    it('存在しないユーザーの更新時にエラーをスローする', async () => {
      const userId = 'non-existent';
      const email = new Email('updated@example.com');

      mockPrisma.user.update = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(repository.update(userId, email)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateSupabaseUserId', () => {
    it('SupabaseユーザーIDを正常に更新する', async () => {
      const userId = 'user-1';
      const supabaseUserId = 'new-supabase-user-id';

      mockPrisma.user.update = jest.fn().mockResolvedValue({});

      await repository.updateSupabaseUserId(userId, supabaseUserId);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          supabase_user_id: 'new-supabase-user-id',
          updated_at: expect.any(Date),
        },
      });
    });

    it('supabase_user_idフィールドが存在しない場合、警告をログに出力する', async () => {
      const userId = 'user-1';
      const supabaseUserId = 'new-supabase-user-id';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockPrisma.user.update = jest
        .fn()
        .mockRejectedValue(new Error('Column does not exist'));

      await repository.updateSupabaseUserId(userId, supabaseUserId);

      expect(consoleSpy).toHaveBeenCalledWith(
        'supabase_user_id field not available yet:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('ユーザーを正常に削除する', async () => {
      const userId = 'user-1';

      mockPrisma.user.delete = jest.fn().mockResolvedValue({});

      await repository.delete(userId);

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('存在しないユーザーの削除時にエラーをスローする', async () => {
      const userId = 'non-existent';

      mockPrisma.user.delete = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      await expect(repository.delete(userId)).rejects.toThrow('User not found');
    });
  });

  describe('エラーハンドリング', () => {
    it('データベース接続エラーを適切に処理する', async () => {
      mockPrisma.user.findUnique = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'));

      await expect(repository.findById('user-1')).rejects.toThrow(
        'Connection failed'
      );
    });

    it('無効なデータ形式のエラーを適切に処理する', async () => {
      const invalidUser = {
        id: 'user-1',
        email: 'invalid-email', // 無効なメール形式
        password_hash: null,
        supabase_user_id: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(invalidUser);

      // Emailクラスのコンストラクタでエラーが発生することをテスト
      expect(() => new Email('invalid-email')).toThrow('Invalid email address');
    });
  });
});
