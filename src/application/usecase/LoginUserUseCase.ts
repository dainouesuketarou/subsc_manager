import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Email } from '../../domain/value-objects/Email';
import { PasswordHasher } from '../../infrastructure/utils/PasswordHasher';
import { JwtTokenManager } from '../../infrastructure/utils/JwtTokenManager';

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  userId: string;
  email: string;
  token: string;
}

export class LoginUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    // バリデーション
    if (!request.email || !request.password) {
      throw new Error('Email and password are required');
    }

    // メールアドレスの形式チェック
    const email = new Email(request.email);

    // ユーザーを検索
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // パスワードの検証
    const isValidPassword = await PasswordHasher.verify(
      request.password,
      user.getPasswordHash()
    );

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // JWTトークンの生成
    const token = JwtTokenManager.generateToken({
      userId: user.toDTO().id,
      email: user.toDTO().email.value,
    });

    return {
      userId: user.toDTO().id,
      email: user.toDTO().email.value,
      token,
    };
  }
}
