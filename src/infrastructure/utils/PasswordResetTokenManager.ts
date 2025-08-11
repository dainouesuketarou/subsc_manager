import crypto from 'crypto';

export class PasswordResetTokenManager {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly EXPIRES_IN_HOURS = 24;

  /**
   * パスワードリセットトークンを生成する
   */
  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * トークンの有効期限を計算する
   */
  static calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + this.EXPIRES_IN_HOURS);
    return expiryDate;
  }

  /**
   * トークンが有効期限切れかどうかをチェックする
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}
