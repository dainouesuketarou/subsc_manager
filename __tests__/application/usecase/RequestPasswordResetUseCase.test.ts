import { RequestPasswordResetUseCase } from '../../../src/application/usecase/RequestPasswordResetUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';

// PasswordResetTokenManagerのモック
jest.mock(
  '../../../src/infrastructure/utils/PasswordResetTokenManager',
  () => ({
    PasswordResetTokenManager: {
      generateToken: jest.fn().mockReturnValue('reset-token-123'),
      calculateExpiryDate: jest.fn().mockReturnValue(new Date('2024-12-31')),
    },
  })
);

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new RequestPasswordResetUseCase(mockRepository);
  });

  describe('execute', () => {
    it('パスワードリセット要求を正常に処理する', async () => {
      const mockUser = User.create('test@example.com', 'hashed-password');

      mockRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);

      const request = {
        email: 'test@example.com',
      };

      const result = await useCase.execute(request);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'test@example.com',
        })
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent successfully');
    });

    it('メールアドレスが不足している場合、エラーを投げる', async () => {
      const request = {
        email: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Email is required'
      );
    });

    it('ユーザーが存在しない場合でも成功メッセージを返す', async () => {
      mockRepository.findByEmail = jest
        .fn()
        .mockRejectedValue(new Error('User not found'));

      const request = {
        email: 'nonexistent@example.com',
      };

      const result = await useCase.execute(request);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Password reset email sent successfully');
    });
  });
});
