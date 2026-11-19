import { User } from '../entities/user.entity.js';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export interface UsersRepository {
  create(user: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<User | null>;
}
