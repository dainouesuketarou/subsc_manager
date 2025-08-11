import { User } from '../../../src/domain/entities/User';

describe('User', () => {
  describe('toDTO', () => {
    it('ユーザーのDTOを取得できる', () => {
      const user = User.create('test@example.com', 'hashed-password');
      const dto = user.toDTO();
      expect(dto.id).toBeDefined();
      expect(dto.email.value).toBe('test@example.com');
      expect(dto.passwordHash).toBe('hashed-password');
    });
  });

  describe('create', () => {
    it('正常なメールアドレスとパスワードハッシュでユーザーを作成できる', () => {
      const user = User.create('test@example.com', 'hashed-password');
      const dto = user.toDTO();
      expect(dto.id).toBeDefined();
      expect(dto.email.value).toBe('test@example.com');
      expect(dto.passwordHash).toBe('hashed-password');
    });
  });

  describe('reconstitute', () => {
    it('ユーザーのDTOを再構成できる', () => {
      const user = User.create('test@example.com', 'hashed-password');
      const dto = user.toDTO();
      const reconstitutedUser = User.reconstitute(dto);
      expect(reconstitutedUser.toDTO()).toEqual(dto);
    });
  });

  describe('getPasswordHash', () => {
    it('パスワードハッシュを取得できる', () => {
      const user = User.create('test@example.com', 'hashed-password');
      expect(user.getPasswordHash()).toBe('hashed-password');
    });
  });

  // 異常系のテスト
  describe('create', () => {
    it('無効なメールアドレスでエラーを投げる', () => {
      expect(() => User.create('invalid-email', 'hashed-password')).toThrow(
        'Invalid email address'
      );
    });
  });
});
