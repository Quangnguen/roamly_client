import { UserRepository } from '../../data/repositories/userRepository';
import { User } from '../models/User';
import { UserApiResponse } from '../../types/UserResponseInterface';
import { GetUsersParams } from '@/src/types/GetUsersParamsInterface';


export class UserUseCase {
  constructor(private repo: UserRepository) { }

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
  async getUsers(params?: GetUsersParams): Promise<any> {
    return await this.repo.getUsers(params);
  }

  async getUserById(userId: string): Promise<UserApiResponse> {
    return await this.repo.getUserById(userId);
  }

  async uploadProfilePicture(imageFile: FormData): Promise<UserApiResponse> {
    return await this.repo.uploadProfilePicture(imageFile);
  }
}
