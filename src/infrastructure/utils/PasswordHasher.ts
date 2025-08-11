import bcrypt from 'bcryptjs';

export class PasswordHasher {
  private static readonly SALT_ROUNDS = 12;

  /**
   * パスワードをハッシュ化する
   */
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * パスワードがハッシュと一致するか検証する
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
