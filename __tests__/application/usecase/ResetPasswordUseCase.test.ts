import { ResetPasswordUseCase } from '../../../src/application/usecase/ResetPasswordUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';

// PasswordHasherのモック
jest.mock('../../../src/infrastructure/utils/PasswordHasher', () => ({
  PasswordHasher: {
    hash: jest.fn().mockResolvedValue('new-hashed-password'),
  },
}));

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ResetPasswordUseCase(mockRepository);
  });

  describe('execute', () => {
    it('パスワードを正常にリセットする', async () => {
      const request = {
        token: 'a1b2c3d4e5f678901234567890123456', // 32文字の16進数
        newPassword: 'newpassword123',
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset successfully');
    });

    it('トークンが不足している場合、エラーを投げる', async () => {
      const request = {
        token: '',
        newPassword: 'newpassword123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Token and new password are required'
      );
    });

    it('新しいパスワードが不足している場合、エラーを投げる', async () => {
      const request = {
        token: 'valid-token',
        newPassword: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Token and new password are required'
      );
    });

    it('パスワードが短すぎる場合、エラーを投げる', async () => {
      const request = {
        token: 'a1b2c3d4e5f678901234567890123456',
        newPassword: '123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('無効なトークン形式の場合、エラーを投げる', async () => {
      const request = {
        token: 'invalid-token-format',
        newPassword: 'newpassword123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });
  });
});
