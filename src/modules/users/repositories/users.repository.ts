import { User } from '../entities/user.entity.js';

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
};

export interface UsersRepository {
  create(data: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<User | null>;
  update(id: string, data: UpdateUserInput): Promise<User | null>;
}
