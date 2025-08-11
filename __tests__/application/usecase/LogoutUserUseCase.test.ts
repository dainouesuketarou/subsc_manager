import { LogoutUserUseCase } from '../../../src/application/usecase/LogoutUserUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';

// JwtTokenManagerのモック
jest.mock('../../../src/infrastructure/utils/JwtTokenManager', () => ({
  JwtTokenManager: {
    verifyToken: jest.fn(),
  },
}));

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new LogoutUserUseCase(mockRepository);
  });

  describe('execute', () => {
    it('ユーザーを正常にログアウトする', async () => {
      const mockUser = User.create('test@example.com', 'hashed-password');
      const {
        JwtTokenManager,
      } = require('../../../src/infrastructure/utils/JwtTokenManager');

      mockRepository.findById = jest.fn().mockResolvedValue(mockUser);
      JwtTokenManager.verifyToken = jest.fn().mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
      });

      const request = {
        token: 'valid-token',
        userId: 'user-1',
      };

      const result = await useCase.execute(request);

      expect(JwtTokenManager.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockRepository.findById).toHaveBeenCalledWith('user-1');
      expect(result.success).toBe(true);
    });

    it('トークンが不足している場合、エラーを投げる', async () => {
      const request = {
        token: '',
        userId: 'user-1',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Token and userId are required'
      );
    });

    it('ユーザーIDが不足している場合、エラーを投げる', async () => {
      const request = {
        token: 'valid-token',
        userId: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Token and userId are required'
      );
    });

    it('トークンのユーザーIDが一致しない場合、エラーを投げる', async () => {
      const {
        JwtTokenManager,
      } = require('../../../src/infrastructure/utils/JwtTokenManager');

      JwtTokenManager.verifyToken = jest.fn().mockReturnValue({
        userId: 'different-user',
        email: 'test@example.com',
      });

      const request = {
        token: 'valid-token',
        userId: 'user-1',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid token for user'
      );
    });
  });
});
