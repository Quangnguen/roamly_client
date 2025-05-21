import { UserRepository } from '../../data/repositories/userRepository';
import { User } from '../models/User';
import { UserApiResponse } from '../../types/UserResponseInterface';

export class UserUseCase {
  constructor(private repo: UserRepository) {}

  async getInfo(): Promise<UserApiResponse> {
    return await this.repo.getInfo();
  }

  async updateInfo(userData: {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    private?: boolean;
  }): Promise<UserApiResponse> {
    return await this.repo.updateInfo(userData);
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    return await this.repo.updatePassword(oldPassword, newPassword);
  }
  async softDelete(): Promise<void> {
    return await this.repo.softDelete();
  }
  async getUsers(): Promise<any> {
    return await this.repo.getUsers();
  }

  async getUserById(userId: string): Promise<UserApiResponse> {
    return await this.repo.getUserById(userId);
  }
}
