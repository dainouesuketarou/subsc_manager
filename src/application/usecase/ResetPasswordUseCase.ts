import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { PasswordHasher } from '../../infrastructure/utils/PasswordHasher';
import { PasswordResetTokenManager } from '../../infrastructure/utils/PasswordResetTokenManager';

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export class ResetPasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    // バリデーション
    if (!request.token || !request.newPassword) {
      throw new Error('Token and new password are required');
    }

    if (request.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    try {
      // トークンの検証（実際の実装ではデータベースからトークンを取得）
      // この実装では簡略化のため、トークンの形式チェックのみを行う

      if (!this.isValidTokenFormat(request.token)) {
        throw new Error('Invalid reset token');
      }

      // パスワードのハッシュ化
      const passwordHash = await PasswordHasher.hash(request.newPassword);

      // ユーザーのパスワードを更新（実際の実装ではリポジトリで更新）
      // この実装では簡略化のため、ハッシュ化のみを行う

      // 使用済みトークンを削除（実際の実装ではデータベースから削除）

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }

  private isValidTokenFormat(token: string): boolean {
    // トークンの形式チェック（32文字の16進数）
    return /^[a-f0-9]{32}$/.test(token);
  }
}
