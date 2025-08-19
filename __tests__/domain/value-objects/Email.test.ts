import { Email } from '../../../src/domain/value-objects/Email';

describe('Email', () => {
  describe('constructor', () => {
    it('正常なメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('様々な形式の正常なメールアドレスでEmailオブジェクトを作成できる', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user@subdomain.example.com',
        'user@example.co.jp',
        'user@example-domain.com',
        'user@example.com',
        'a@b.c',
        'user@example-domain123.com',
      ];

      validEmails.forEach(emailStr => {
        const email = new Email(emailStr);
        expect(email.value).toBe(emailStr);
      });
    });

    it('Unicode文字を含むメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('ユーザー@example.com');
      expect(email.value).toBe('ユーザー@example.com');
    });

    it('長いメールアドレスでEmailオブジェクトを作成できる', () => {
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
      const email = new Email(longEmail);
      expect(email.value).toBe(longEmail);
    });

    it('空のメールアドレスでエラーを投げる', () => {
      expect(() => new Email('')).toThrow('Email is required');
    });

    it('空白文字のみのメールアドレスでエラーを投げる', () => {
      expect(() => new Email('   ')).toThrow('Invalid email address');
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

    it('複数の@記号があるメールアドレスでエラーを投げる', () => {
      expect(() => new Email('test@@example.com')).toThrow(
        'Invalid email address'
      );
    });

    it('@記号が最初にあるメールアドレスでエラーを投げる', () => {
      expect(() => new Email('@example.com')).toThrow('Invalid email address');
    });

    it('@記号が最後にあるメールアドレスでエラーを投げる', () => {
      expect(() => new Email('test@')).toThrow('Invalid email address');
    });

    it('ドメインにドットがないメールアドレスでエラーを投げる', () => {
      expect(() => new Email('test@example')).toThrow('Invalid email address');
    });

    it('ドメインがドットで終わるメールアドレスでエラーを投げる', () => {
      expect(() => new Email('test@example.')).toThrow('Invalid email address');
    });

    it('ドメインがドットで始まるメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test@.example.com');
      expect(email.value).toBe('test@.example.com');
    });

    it('連続するドットがあるメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test@example..com');
      expect(email.value).toBe('test@example..com');
    });

    it('特殊文字を含むメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test<script>@example.com');
      expect(email.value).toBe('test<script>@example.com');
    });

    it('制御文字を含むメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('test\x00@example.com');
      expect(email.value).toBe('test\x00@example.com');
    });
  });

  describe('Email value property', () => {
    it('valueプロパティが正しい値を返す', () => {
      const emailStr = 'user@example.com';
      const email = new Email(emailStr);
      expect(email.value).toBe(emailStr);
    });
  });

  describe('Email equality', () => {
    it('同じ値を持つEmailオブジェクトが等しい', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.value).toBe(email2.value);
    });

    it('異なる値を持つEmailオブジェクトが等しくない', () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');
      expect(email1.value).not.toBe(email2.value);
    });

    it('大文字小文字が異なるEmailオブジェクトが等しくない', () => {
      const email1 = new Email('user@example.com');
      const email2 = new Email('USER@EXAMPLE.COM');
      expect(email1.value).not.toBe(email2.value);
    });
  });

  describe('Email edge cases', () => {
    it('nullのメールアドレスでエラーを投げる', () => {
      expect(() => new Email(null as any)).toThrow('Email is required');
    });

    it('undefinedのメールアドレスでエラーを投げる', () => {
      expect(() => new Email(undefined as any)).toThrow('Email is required');
    });

    it('数値のメールアドレスでエラーを投げる', () => {
      expect(() => new Email(123 as any)).toThrow(
        'value.match is not a function'
      );
    });

    it('booleanのメールアドレスでエラーを投げる', () => {
      expect(() => new Email(true as any)).toThrow(
        'value.match is not a function'
      );
    });

    it('オブジェクトのメールアドレスでエラーを投げる', () => {
      expect(() => new Email({} as any)).toThrow(
        'value.match is not a function'
      );
    });

    it('配列のメールアドレスでエラーを投げる', () => {
      expect(() => new Email([] as any)).toThrow(
        'value.match is not a function'
      );
    });

    it('関数のメールアドレスでエラーを投げる', () => {
      expect(() => new Email((() => {}) as any)).toThrow(
        'value.match is not a function'
      );
    });
  });

  describe('Email with special characters', () => {
    it('SQLインジェクションのような文字列でエラーを投げる', () => {
      expect(() => new Email("'; DROP TABLE users; --")).toThrow(
        'Invalid email address'
      );
    });

    it('HTMLタグを含む文字列でEmailオブジェクトを作成できる', () => {
      const email = new Email('<script>alert("test")</script>@example.com');
      expect(email.value).toBe('<script>alert("test")</script>@example.com');
    });

    it('改行文字を含む文字列でエラーを投げる', () => {
      expect(() => new Email('test\n@example.com')).toThrow(
        'Invalid email address'
      );
    });

    it('タブ文字を含む文字列でエラーを投げる', () => {
      expect(() => new Email('test\t@example.com')).toThrow(
        'Invalid email address'
      );
    });

    it('制御文字を含む文字列でEmailオブジェクトを作成できる', () => {
      const email = new Email('test\x00@example.com');
      expect(email.value).toBe('test\x00@example.com');
    });
  });

  describe('Email with extreme values', () => {
    it('非常に長いメールアドレスでEmailオブジェクトを作成できる', () => {
      const longEmail = 'a'.repeat(1000) + '@' + 'b'.repeat(1000) + '.com';
      const email = new Email(longEmail);
      expect(email.value).toBe(longEmail);
    });

    it('最小の有効なメールアドレスでEmailオブジェクトを作成できる', () => {
      const email = new Email('a@b.c');
      expect(email.value).toBe('a@b.c');
    });
  });
});
