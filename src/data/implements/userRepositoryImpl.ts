import { UserRepository } from '../repositories/userRepository';
import { getUserProfile, updateUserProfile, changePassword } from '../api/userApi';
import { User } from '../../domain/models/User';

export class UserRepositoryImpl implements UserRepository {
  async getInfo(id: string): Promise<User> {
    console.log('Fetching user info for ID:', id);
    try {
      const response = await getUserProfile(id);
      console.log('getInfo response:', response);

      const data = response;
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        username: data.username,
        token: data.token,
        bio: data.bio,
        profilePic: data.profilePic,
        accountStatus: data.accountStatus,
        role: data.role,
        private: data.private,
        followers: data.followers,
        following: data.following,
        refreshToken: data.refreshToken,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      };
      return user;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw new Error('Failed to fetch user info');
    }
  }

  async updateInfo(userData: {
    name?: string;
    email?: string;
    username?: string;
    bio?: string;
    profilePic?: string;
    privateAccount?: boolean;
  }): Promise<User> {
    console.log('Updating user profile with data:', userData);
    try {
      const response = await updateUserProfile(userData);
      console.log('updateUserProfile response:', response);

      const data = response.data;
      const user: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        username: data.username,
        token: data.token,
        bio: data.bio,
        profilePic: data.profilePic,
        accountStatus: data.accountStatus,
        role: data.role,
        private: data.private,
        followers: data.followers,
        following: data.following,
        refreshToken: data.refreshToken,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      };
      return user;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    console.log('Updating password...');
    try {
      const response = await changePassword({ oldPassword, newPassword });
      console.log('updatePassword response:', response);

      if (response.status === 200) {
        console.log('Password updated successfully');
        return;
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      throw new Error('Failed to update password');
    }
  }
}
