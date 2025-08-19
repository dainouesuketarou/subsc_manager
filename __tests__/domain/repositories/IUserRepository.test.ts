import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';

// モックの実装
class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();
  private usersBySupabaseId: Map<string, User> = new Map();

  async findById(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    return user;
  }

  async findByEmail(email: Email): Promise<User> {
    const user = this.usersByEmail.get(email.value);
    if (!user) {
      throw new Error(`User not found with email: ${email.value}`);
    }
    return user;
  }

  async findBySupabaseUserId(supabaseUserId: string): Promise<User | null> {
    return this.usersBySupabaseId.get(supabaseUserId) || null;
  }

  async create(email: Email, passwordHash: string): Promise<void> {
    const user = User.createWithPassword(email.value, passwordHash);
    const dto = user.toDTO();
    this.users.set(dto.id, user);
    this.usersByEmail.set(email.value, user);
  }

  async createWithSupabaseUser(
    email: Email,
    supabaseUserId: string
  ): Promise<void> {
    const user = User.create(email.value, supabaseUserId);
    const dto = user.toDTO();
    this.users.set(dto.id, user);
    this.usersByEmail.set(email.value, user);
    this.usersBySupabaseId.set(supabaseUserId, user);
  }

  async update(userId: string, email: Email): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    // 実際の実装では、ユーザーの更新ロジックが必要
    const updatedUser = User.reconstitute({
      ...user.toDTO(),
      email,
    });
    this.users.set(userId, updatedUser);
    this.usersByEmail.set(email.value, updatedUser);
  }

  async delete(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found with id: ${userId}`);
    }
    const dto = user.toDTO();
    this.users.delete(userId);
    this.usersByEmail.delete(dto.email.value);
    if (dto.supabaseUserId) {
      this.usersBySupabaseId.delete(dto.supabaseUserId);
    }
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.usersBySupabaseId.clear();
  }

  getUserCount(): number {
    return this.users.size;
  }
}

describe('IUserRepository', () => {
  let repository: MockUserRepository;
  let testEmail: Email;
  let testPasswordHash: string;
  let testSupabaseUserId: string;

  beforeEach(() => {
    repository = new MockUserRepository();
    testEmail = new Email('test@example.com');
    testPasswordHash = 'hashed-password-123';
    testSupabaseUserId = 'supabase-user-123';
  });

  afterEach(() => {
    repository.clear();
  });

  describe('create', () => {
    it('正常なメールアドレスとパスワードハッシュでユーザーを作成できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      expect(repository.getUserCount()).toBe(1);
    });

    it('同じメールアドレスで複数のユーザーを作成できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      await repository.create(testEmail, 'different-hash');
      expect(repository.getUserCount()).toBe(2);
    });

    it('異なるメールアドレスで複数のユーザーを作成できる', async () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');

      await repository.create(email1, testPasswordHash);
      await repository.create(email2, testPasswordHash);

      expect(repository.getUserCount()).toBe(2);
    });

    it('空のパスワードハッシュでユーザーを作成できる', async () => {
      await repository.create(testEmail, '');
      expect(repository.getUserCount()).toBe(1);
    });

    it('非常に長いパスワードハッシュでユーザーを作成できる', async () => {
      const longHash = 'A'.repeat(1000);
      await repository.create(testEmail, longHash);
      expect(repository.getUserCount()).toBe(1);
    });
  });

  describe('createWithSupabaseUser', () => {
    it('正常なメールアドレスとSupabaseユーザーIDでユーザーを作成できる', async () => {
      await repository.createWithSupabaseUser(testEmail, testSupabaseUserId);
      expect(repository.getUserCount()).toBe(1);
    });

    it('同じSupabaseユーザーIDで複数のユーザーを作成できる', async () => {
      await repository.createWithSupabaseUser(testEmail, testSupabaseUserId);
      const email2 = new Email('user2@example.com');
      await repository.createWithSupabaseUser(email2, testSupabaseUserId);
      expect(repository.getUserCount()).toBe(2);
    });

    it('空のSupabaseユーザーIDでユーザーを作成できる', async () => {
      await repository.createWithSupabaseUser(testEmail, '');
      expect(repository.getUserCount()).toBe(1);
    });

    it('非常に長いSupabaseユーザーIDでユーザーを作成できる', async () => {
      const longSupabaseId = 'A'.repeat(1000);
      await repository.createWithSupabaseUser(testEmail, longSupabaseId);
      expect(repository.getUserCount()).toBe(1);
    });
  });

  describe('findById', () => {
    it('存在するユーザーIDでユーザーを取得できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      const foundUser = await repository.findById(userId);
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser.toDTO().email.value).toBe(testEmail.value);
    });

    it('存在しないユーザーIDでエラーを投げる', async () => {
      await expect(repository.findById('non-existent-id')).rejects.toThrow(
        'User not found with id: non-existent-id'
      );
    });

    it('空文字列のユーザーIDでエラーを投げる', async () => {
      await expect(repository.findById('')).rejects.toThrow(
        'User not found with id: '
      );
    });

    it('nullのユーザーIDでエラーを投げる', async () => {
      await expect(repository.findById(null as any)).rejects.toThrow(
        'User not found with id: null'
      );
    });

    it('undefinedのユーザーIDでエラーを投げる', async () => {
      await expect(repository.findById(undefined as any)).rejects.toThrow(
        'User not found with id: undefined'
      );
    });
  });

  describe('findByEmail', () => {
    it('存在するメールアドレスでユーザーを取得できる', async () => {
      await repository.create(testEmail, testPasswordHash);

      const foundUser = await repository.findByEmail(testEmail);
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser.toDTO().email.value).toBe(testEmail.value);
    });

    it('存在しないメールアドレスでエラーを投げる', async () => {
      const nonExistentEmail = new Email('nonexistent@example.com');
      await expect(repository.findByEmail(nonExistentEmail)).rejects.toThrow(
        'User not found with email: nonexistent@example.com'
      );
    });

    it('大文字小文字が異なるメールアドレスでエラーを投げる', async () => {
      await repository.create(testEmail, testPasswordHash);
      const differentCaseEmail = new Email('TEST@EXAMPLE.COM');

      await expect(repository.findByEmail(differentCaseEmail)).rejects.toThrow(
        'User not found with email: TEST@EXAMPLE.COM'
      );
    });
  });

  describe('findBySupabaseUserId', () => {
    it('存在するSupabaseユーザーIDでユーザーを取得できる', async () => {
      await repository.createWithSupabaseUser(testEmail, testSupabaseUserId);

      const foundUser =
        await repository.findBySupabaseUserId(testSupabaseUserId);
      expect(foundUser).toBeInstanceOf(User);
      expect(foundUser?.toDTO().supabaseUserId).toBe(testSupabaseUserId);
    });

    it('存在しないSupabaseユーザーIDでnullを返す', async () => {
      const result = await repository.findBySupabaseUserId('non-existent-id');
      expect(result).toBeNull();
    });

    it('空文字列のSupabaseユーザーIDでnullを返す', async () => {
      const result = await repository.findBySupabaseUserId('');
      expect(result).toBeNull();
    });

    it('通常のユーザー作成ではSupabaseユーザーIDで検索できない', async () => {
      await repository.create(testEmail, testPasswordHash);

      const result = await repository.findBySupabaseUserId(testSupabaseUserId);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('存在するユーザーのメールアドレスを更新できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      const newEmail = new Email('updated@example.com');
      await repository.update(userId, newEmail);

      const updatedUser = await repository.findById(userId);
      expect(updatedUser.toDTO().email.value).toBe(newEmail.value);
    });

    it('存在しないユーザーIDで更新時にエラーを投げる', async () => {
      const newEmail = new Email('updated@example.com');
      await expect(
        repository.update('non-existent-id', newEmail)
      ).rejects.toThrow('User not found with id: non-existent-id');
    });

    it('同じメールアドレスで更新できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      await repository.update(userId, testEmail);

      const updatedUser = await repository.findById(userId);
      expect(updatedUser.toDTO().email.value).toBe(testEmail.value);
    });
  });

  describe('delete', () => {
    it('存在するユーザーを削除できる', async () => {
      await repository.create(testEmail, testPasswordHash);
      expect(repository.getUserCount()).toBe(1);

      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      await repository.delete(userId);
      expect(repository.getUserCount()).toBe(0);
    });

    it('存在しないユーザーIDで削除時にエラーを投げる', async () => {
      await expect(repository.delete('non-existent-id')).rejects.toThrow(
        'User not found with id: non-existent-id'
      );
    });

    it('Supabaseユーザーも削除される', async () => {
      await repository.createWithSupabaseUser(testEmail, testSupabaseUserId);
      expect(repository.getUserCount()).toBe(1);

      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      await repository.delete(userId);
      expect(repository.getUserCount()).toBe(0);

      const result = await repository.findBySupabaseUserId(testSupabaseUserId);
      expect(result).toBeNull();
    });

    it('削除後に同じIDで検索するとエラーを投げる', async () => {
      await repository.create(testEmail, testPasswordHash);
      const users = Array.from(repository['users'].values());
      const userId = users[0].toDTO().id;

      await repository.delete(userId);

      await expect(repository.findById(userId)).rejects.toThrow(
        `User not found with id: ${userId}`
      );
    });
  });

  describe('Repository behavior', () => {
    it('複数のユーザーを管理できる', async () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');
      const email3 = new Email('user3@example.com');

      await repository.create(email1, 'hash1');
      await repository.create(email2, 'hash2');
      await repository.createWithSupabaseUser(email3, 'supabase3');

      expect(repository.getUserCount()).toBe(3);
    });

    it('同じメールアドレスで複数のユーザーを作成・管理できる', async () => {
      await repository.create(testEmail, 'hash1');
      await repository.create(testEmail, 'hash2');
      await repository.createWithSupabaseUser(testEmail, 'supabase1');

      expect(repository.getUserCount()).toBe(3);
    });

    it('クリア後にユーザーが存在しない', async () => {
      await repository.create(testEmail, testPasswordHash);
      expect(repository.getUserCount()).toBe(1);

      repository.clear();
      expect(repository.getUserCount()).toBe(0);
    });
  });
});
