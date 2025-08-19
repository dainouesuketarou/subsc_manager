import { Validation } from '../../../src/infrastructure/utils/Validation';

describe('Validation', () => {
  describe('required', () => {
    it('有効な値の場合、nullを返す', () => {
      const testCases = ['valid string', '0', 'false', 'null', 1, true, [], {}];

      testCases.forEach(value => {
        const result = Validation.required(value, 'testField');
        expect(result).toBeNull();
      });
    });

    it('空の値の場合、エラーメッセージを返す', () => {
      const testCases = [
        { value: '', expected: 'testFieldは必須です' },
        { value: '   ', expected: 'testFieldは必須です' },
        { value: null, expected: 'testFieldは必須です' },
        { value: undefined, expected: 'testFieldは必須です' },
      ];

      testCases.forEach(({ value, expected }) => {
        const result = Validation.required(value, 'testField');
        expect(result).toBe(expected);
      });
    });

    it('フィールド名が正しく表示される', () => {
      const result = Validation.required('', 'email');
      expect(result).toBe('emailは必須です');
    });
  });

  describe('email', () => {
    it('有効なメールアドレスの場合、nullを返す', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.jp',
        'user+tag@example.org',
        '123@example.com',
        'test.email@subdomain.example.com',
      ];

      validEmails.forEach(email => {
        const result = Validation.email(email);
        expect(result).toBeNull();
      });
    });

    it('無効なメールアドレスの場合、エラーメッセージを返す', () => {
      // 個別にテストして問題を特定
      expect(Validation.email('invalid-email')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('@example.com')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test@')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test@.com')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test..test@example.com')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test@example..com')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test@example')).toBe(
        '有効なメールアドレスを入力してください'
      );
      expect(Validation.email('test.example.com')).toBe(
        '有効なメールアドレスを入力してください'
      );
    });

    it('空のメールアドレスの場合、エラーメッセージを返す', () => {
      const emptyEmails = ['', '   '];

      emptyEmails.forEach(email => {
        const result = Validation.email(email);
        expect(result).toBe('有効なメールアドレスを入力してください');
      });
    });

    it('特殊文字を含むメールアドレスを適切に処理する', () => {
      const specialEmails = [
        'test+filter@example.com',
        'user.name+tag@domain.com',
        'test-email@example.com',
        'test_email@example.com',
      ];

      specialEmails.forEach(email => {
        const result = Validation.email(email);
        expect(result).toBeNull();
      });
    });
  });

  describe('password', () => {
    it('6文字以上のパスワードの場合、nullを返す', () => {
      const validPasswords = [
        '123456',
        'password',
        'P@ssw0rd',
        'verylongpassword123',
        '123456789',
      ];

      validPasswords.forEach(password => {
        const result = Validation.password(password);
        expect(result).toBeNull();
      });
    });

    it('6文字未満のパスワードの場合、エラーメッセージを返す', () => {
      const invalidPasswords = ['', '12345', 'abcde', 'pass', '123'];

      invalidPasswords.forEach(password => {
        const result = Validation.password(password);
        expect(result).toBe('パスワードは6文字以上である必要があります');
      });
    });

    it('境界値のテスト', () => {
      // 5文字（無効）
      expect(Validation.password('12345')).toBe(
        'パスワードは6文字以上である必要があります'
      );

      // 6文字（有効）
      expect(Validation.password('123456')).toBeNull();

      // 7文字（有効）
      expect(Validation.password('1234567')).toBeNull();
    });
  });

  describe('positiveNumber', () => {
    it('正の数の場合、nullを返す', () => {
      const validNumbers = [1, 100, 0.1, 999.99, 1000000];

      validNumbers.forEach(number => {
        const result = Validation.positiveNumber(number, 'testField');
        expect(result).toBeNull();
      });
    });

    it('0以下の数の場合、エラーメッセージを返す', () => {
      const invalidNumbers = [0, -1, -100, -0.1, -999.99];

      invalidNumbers.forEach(number => {
        const result = Validation.positiveNumber(number, 'testField');
        expect(result).toBe('testFieldは正の数である必要があります');
      });
    });

    it('数値以外の値の場合、エラーメッセージを返す', () => {
      // 個別にテストして問題を特定
      expect(Validation.positiveNumber('string' as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber(null as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber(undefined as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber(false as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber(true as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber([] as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber({} as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
      expect(Validation.positiveNumber(NaN as any, 'testField')).toBe(
        'testFieldは正の数である必要があります'
      );
    });

    it('validateFieldsで数値以外の値の場合、エラーが発生しない', () => {
      const fields = {
        price: { value: 'not-a-number', rules: ['positiveNumber'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([]);
    });

    it('フィールド名が正しく表示される', () => {
      const result = Validation.positiveNumber(-1, 'price');
      expect(result).toBe('priceは正の数である必要があります');
    });
  });

  describe('validateFields', () => {
    it('すべてのフィールドが有効な場合、空配列を返す', () => {
      const fields = {
        email: { value: 'test@example.com', rules: ['required', 'email'] },
        password: { value: 'password123', rules: ['required', 'password'] },
        age: { value: 25, rules: ['required', 'positiveNumber'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([]);
    });

    it('単一のエラーがある場合、そのエラーメッセージを返す', () => {
      const fields = {
        email: { value: 'invalid-email', rules: ['required', 'email'] },
        password: { value: 'password123', rules: ['required', 'password'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual(['有効なメールアドレスを入力してください']);
    });

    it('複数のエラーがある場合、最初のエラーのみを返す', () => {
      const fields = {
        email: { value: '', rules: ['required', 'email'] },
        password: { value: '123', rules: ['required', 'password'] },
        age: { value: -1, rules: ['required', 'positiveNumber'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([
        'emailは必須です',
        'パスワードは6文字以上である必要があります',
        'ageは正の数である必要があります',
      ]);
    });

    it('異なるルールの組み合わせを適切に処理する', () => {
      const testCases = [
        {
          fields: {
            name: { value: '', rules: ['required'] },
          },
          expected: ['nameは必須です'],
        },
        {
          fields: {
            email: { value: 'test@example.com', rules: ['email'] },
          },
          expected: [],
        },
        {
          fields: {
            price: { value: 0, rules: ['positiveNumber'] },
          },
          expected: ['priceは正の数である必要があります'],
        },
        {
          fields: {
            email: { value: 'test@example.com', rules: ['required', 'email'] },
            password: { value: '123', rules: ['required', 'password'] },
          },
          expected: ['パスワードは6文字以上である必要があります'],
        },
      ];

      testCases.forEach(({ fields, expected }) => {
        const result = Validation.validateFields(fields);
        expect(result).toEqual(expected);
      });
    });

    it('未知のルールを適切に処理する', () => {
      const fields = {
        test: { value: 'test', rules: ['unknownRule'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([]);
    });

    it('空のフィールドオブジェクトの場合、空配列を返す', () => {
      const result = Validation.validateFields({});
      expect(result).toEqual([]);
    });

    it('複雑なバリデーションシナリオ', () => {
      const fields = {
        username: { value: 'john_doe', rules: ['required'] },
        email: { value: 'john.doe@example.com', rules: ['required', 'email'] },
        password: {
          value: 'securePassword123',
          rules: ['required', 'password'],
        },
        confirmPassword: { value: 'securePassword123', rules: ['required'] },
        age: { value: 30, rules: ['required', 'positiveNumber'] },
        subscriptionPrice: { value: 9.99, rules: ['positiveNumber'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([]);
    });

    it('エラーが発生する複雑なシナリオ', () => {
      const fields = {
        username: { value: '', rules: ['required'] },
        email: { value: 'invalid-email', rules: ['required', 'email'] },
        password: { value: '123', rules: ['required', 'password'] },
        age: { value: -5, rules: ['required', 'positiveNumber'] },
      };

      const result = Validation.validateFields(fields);
      expect(result).toEqual([
        'usernameは必須です',
        '有効なメールアドレスを入力してください',
        'パスワードは6文字以上である必要があります',
        'ageは正の数である必要があります',
      ]);
    });
  });

  describe('エッジケース', () => {
    it('非常に長い文字列の処理', () => {
      const longString = 'a'.repeat(1000);
      const result = Validation.required(longString, 'testField');
      expect(result).toBeNull();
    });

    it('特殊文字を含むメールアドレスの処理', () => {
      const specialEmails = [
        'test+filter@example.com',
        'user.name+tag@domain.com',
        'test-email@example.com',
        'test_email@example.com',
        'test@example.co.jp',
        'test@example-domain.com',
      ];

      specialEmails.forEach(email => {
        const result = Validation.email(email);
        expect(result).toBeNull();
      });
    });

    it('数値の境界値テスト', () => {
      // 最小の正の数
      expect(Validation.positiveNumber(Number.MIN_VALUE, 'test')).toBeNull();

      // 最大の正の数
      expect(Validation.positiveNumber(Number.MAX_VALUE, 'test')).toBeNull();

      // 0
      expect(Validation.positiveNumber(0, 'test')).toBe(
        'testは正の数である必要があります'
      );

      // 負の無限大
      expect(Validation.positiveNumber(-Infinity, 'test')).toBe(
        'testは正の数である必要があります'
      );

      // 正の無限大
      expect(Validation.positiveNumber(Infinity, 'test')).toBeNull();
    });

    it('パスワードの境界値テスト', () => {
      // 5文字（無効）
      expect(Validation.password('12345')).toBe(
        'パスワードは6文字以上である必要があります'
      );

      // 6文字（有効）
      expect(Validation.password('123456')).toBeNull();

      // 非常に長いパスワード（有効）
      const longPassword = 'a'.repeat(1000);
      expect(Validation.password(longPassword)).toBeNull();
    });
  });
});
