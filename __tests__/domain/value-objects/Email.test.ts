import { Email } from '../../../src/domain/value-objects/Email';

describe('Email', () => {
  describe('constructor', () => {
    it('正常なメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('空のメールアドレスでエラーを投げる', () => {
      expect(() => new Email('')).toThrow('Email is required');
    });

    it('無効なメールアドレスでエラーを投げる', () => {
      expect(() => new Email('invalid-email')).toThrow('Invalid email address');
    });

    it('@記号がないメールアドレスでエラーを投げる', () => {
      expect(() => new Email('testexample.com')).toThrow(
        'Invalid email address'
      );
    });

    it('ドメインがないメールアドレスでエラーを投げる', () => {
      expect(() => new Email('test@')).toThrow('Invalid email address');
    });
  });
});
