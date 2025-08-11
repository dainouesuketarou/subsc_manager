import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { JwtTokenManager } from '../../infrastructure/utils/JwtTokenManager';

export interface LogoutUserRequest {
  token: string;
  userId: string;
}

export interface LogoutUserResponse {
  success: boolean;
}

export class LogoutUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: LogoutUserRequest): Promise<LogoutUserResponse> {
    // バリデーション
    if (!request.token || !request.userId) {
      throw new Error('Token and userId are required');
    }

    // JWTトークンの検証
    const payload = JwtTokenManager.verifyToken(request.token);

    // ユーザーIDの一致確認
    if (payload.userId !== request.userId) {
      throw new Error('Invalid token for user');
    }

    // ユーザーの存在確認
    await this.userRepository.findById(request.userId);

    // トークンをブラックリストに追加（実際の実装ではデータベースに保存）
    // この実装では簡略化のため、トークンの検証のみを行う

    return {
      success: true,
    };
  }
}
