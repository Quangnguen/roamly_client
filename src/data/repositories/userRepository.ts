import { User } from '../../domain/models/User';

export interface UserRepository {
  getInfo(id: string): Promise<User>;
  updateInfo(userData: {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    privateAccount?: boolean;
  }): Promise<User>;
  updatePassword(oldPassword: string, newPassword: string): Promise<void>;
}
