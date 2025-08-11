import { User, UserId } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  findById(userId: UserId): Promise<User>;
  findByEmail(email: Email): Promise<User>;
  create(email: Email, passwordHash: string): Promise<void>;
  update(userId: UserId, email: Email): Promise<void>;
  delete(userId: UserId): Promise<void>;
}
