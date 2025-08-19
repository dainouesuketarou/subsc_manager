export class Validation {
  /**
   * 必須フィールドのバリデーション
   */
  static required(value: unknown, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName}は必須です`;
    }
    return null;
  }

  /**
   * メールアドレスのバリデーション
   */
  static email(email: string): string | null {
    // 基本的なメールアドレス正規表現（連続したドットをチェック）
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return '有効なメールアドレスを入力してください';
    }

    // 連続したドットをチェック
    if (email.includes('..')) {
      return '有効なメールアドレスを入力してください';
    }

    return null;
  }

  /**
   * パスワードのバリデーション
   */
  static password(password: string): string | null {
    if (password.length < 6) {
      return 'パスワードは6文字以上である必要があります';
    }
    return null;
  }

  /**
   * 数値のバリデーション
   */
  static positiveNumber(value: number, fieldName: string): string | null {
    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      return `${fieldName}は正の数である必要があります`;
    }
    return null;
  }

  /**
   * 複数フィールドのバリデーション
   */
  static validateFields(
    fields: Record<string, { value: unknown; rules: string[] }>
  ): string[] {
    const errors: string[] = [];

    for (const [fieldName, { value, rules }] of Object.entries(fields)) {
      for (const rule of rules) {
        let error: string | null = null;

        switch (rule) {
          case 'required':
            error = this.required(value, fieldName);
            break;
          case 'email':
            if (value && typeof value === 'string') {
              error = this.email(value);
            }
            break;
          case 'password':
            if (value && typeof value === 'string') {
              error = this.password(value);
            }
            break;
          case 'positiveNumber':
            if (typeof value === 'number') {
              error = this.positiveNumber(value, fieldName);
            }
            break;
        }

        if (error) {
          errors.push(error);
          break; // 最初のエラーで停止
        }
      }
    }

    return errors;
  }
}
