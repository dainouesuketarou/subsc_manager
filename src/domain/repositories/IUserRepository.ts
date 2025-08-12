import { User, UserId } from '../entities/User';
import { Email } from '../value-objects/Email';

export interface IUserRepository {
  findById(userId: UserId): Promise<User>;
  findByEmail(email: Email): Promise<User>;
  findBySupabaseUserId(supabaseUserId: string): Promise<User | null>;
  create(email: Email, passwordHash: string): Promise<void>;
  createWithSupabaseUser(email: Email, supabaseUserId: string): Promise<void>;
  update(userId: UserId, email: Email): Promise<void>;
  delete(userId: UserId): Promise<void>;
}
