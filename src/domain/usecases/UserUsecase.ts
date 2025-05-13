import { UserRepository } from '../../data/repositories/userRepository';
import { User } from '../models/User';

export class UserUseCase {
  constructor(private repo: UserRepository) {}

  async getInfo(id: string): Promise<User> {
    return await this.repo.getInfo(id);
  }

  async updateInfo(userData: {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    privateAccount?: boolean;
  }): Promise<User> {
    return await this.repo.updateInfo(userData);
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    return await this.repo.updatePassword(oldPassword, newPassword);
  }
}
