import { LoginUserUseCase } from '../../../src/application/usecase/LoginUserUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';

// PasswordHasherとJwtTokenManagerのモック
jest.mock('../../../src/infrastructure/utils/PasswordHasher', () => ({
  PasswordHasher: {
    verify: jest.fn(),
  },
}));

jest.mock('../../../src/infrastructure/utils/JwtTokenManager', () => ({
  JwtTokenManager: {
    generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
  },
}));

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new LoginUserUseCase(mockRepository);
  });

  describe('execute', () => {
    it('ユーザーを正常にログインする', async () => {
      const mockUser = User.create('test@example.com', 'hashed-password');
      const {
        PasswordHasher,
      } = require('../../../src/infrastructure/utils/PasswordHasher');

      mockRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      PasswordHasher.verify = jest.fn().mockResolvedValue(true);

      const request = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await useCase.execute(request);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email)
      );
      expect(PasswordHasher.verify).toHaveBeenCalledWith(
        'password123',
        'hashed-password'
      );
      expect(result.userId).toBe(mockUser.toDTO().id);
      expect(result.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('メールアドレスが不足している場合、エラーを投げる', async () => {
      const request = {
        email: '',
        password: 'password123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Email and password are required'
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('パスワードが不足している場合、エラーを投げる', async () => {
      const request = {
        email: 'test@example.com',
        password: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Email and password are required'
      );

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('パスワードが間違っている場合、エラーを投げる', async () => {
      const mockUser = User.create('test@example.com', 'hashed-password');
      const {
        PasswordHasher,
      } = require('../../../src/infrastructure/utils/PasswordHasher');

      mockRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);
      PasswordHasher.verify = jest.fn().mockResolvedValue(false);

      const request = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });
});
