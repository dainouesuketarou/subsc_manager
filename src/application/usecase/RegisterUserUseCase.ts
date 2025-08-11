import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import { PasswordHasher } from '../../infrastructure/utils/PasswordHasher';

export interface RegisterUserRequest {
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  userId: string;
  email: string;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    // バリデーション
    if (!request.email || !request.password) {
      throw new Error('Email and password are required');
    }

    if (request.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // メールアドレスの形式チェック
    const email = new Email(request.email);

    // パスワードのハッシュ化
    const passwordHash = await PasswordHasher.hash(request.password);

    // ユーザーエンティティの作成
    const user = User.create(email.value, passwordHash);

    // リポジトリに保存
    await this.userRepository.create(email, passwordHash);

    return {
      userId: user.toDTO().id,
      email: user.toDTO().email.value,
    };
  }
}
