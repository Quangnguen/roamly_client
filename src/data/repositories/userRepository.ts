import { UserApiResponse } from '@/src/types/UserResponseInterface';

export interface UserRepository {
  getInfo(): Promise<UserApiResponse>;
  updateInfo(userData: {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    private?: boolean;
  }): Promise<UserApiResponse>;
  updatePassword(oldPassword: string, newPassword: string): Promise<void>;
  softDelete(): Promise<void>;
  getUsers(): Promise<any>;
  getUserById(userId: string): Promise<UserApiResponse>;
}
