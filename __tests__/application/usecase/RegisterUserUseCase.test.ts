import { RegisterUserUseCase } from '../../../src/application/usecase/RegisterUserUseCase';
import { IUserRepository } from '../../../src/domain/repositories/IUserRepository';
import { User } from '../../../src/domain/entities/User';
import { Email } from '../../../src/domain/value-objects/Email';

// PasswordHasherのモック
jest.mock('../../../src/infrastructure/utils/PasswordHasher', () => ({
  PasswordHasher: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
  },
}));

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new RegisterUserUseCase(mockRepository);
  });

  describe('execute', () => {
    it('ユーザーを正常に登録する', async () => {
      const request = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockRepository.create = jest.fn().mockResolvedValue(undefined);

      const result = await useCase.execute(request);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.any(Email),
        'hashed-password'
      );
      expect(result.userId).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('メールアドレスが不足している場合、エラーを投げる', async () => {
      const request = {
        email: '',
        password: 'password123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Email and password are required'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('パスワードが不足している場合、エラーを投げる', async () => {
      const request = {
        email: 'test@example.com',
        password: '',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Email and password are required'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('パスワードが短すぎる場合、エラーを投げる', async () => {
      const request = {
        email: 'test@example.com',
        password: '123',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        'Password must be at least 8 characters long'
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });
});
