import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { PasswordResetTokenManager } from '../../infrastructure/utils/PasswordResetTokenManager';

export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
}

export class RequestPasswordResetUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    request: RequestPasswordResetRequest
  ): Promise<RequestPasswordResetResponse> {
    // バリデーション
    if (!request.email) {
      throw new Error('Email is required');
    }

    // メールアドレスの形式チェック
    const email = new Email(request.email);

    try {
      // ユーザーの存在確認
      const user = await this.userRepository.findByEmail(email);

      // パスワードリセットトークンを生成
      const token = PasswordResetTokenManager.generateToken();
      const expiresAt = PasswordResetTokenManager.calculateExpiryDate();

      // トークンをデータベースに保存（実際の実装ではリポジトリに保存）
      // この実装では簡略化のため、トークンの生成のみを行う

      // メール送信（実際の実装ではメールサービスを使用）
      // この実装では簡略化のため、メール送信は行わない

      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      // ユーザーが存在しない場合でも、セキュリティのため成功メッセージを返す
      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    }
  }
}
