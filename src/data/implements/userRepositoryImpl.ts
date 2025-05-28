import { UserRepository } from '../repositories/userRepository';
import { getUserProfile, updateUserProfile, changePassword, getUsers, getUserById as getUserByIdApi, uploadProfilePicture } from '../api/userApi';
import { UserApiResponse } from '@/src/types/UserResponseInterface';
import { GetUsersParams } from '@/src/types/GetUsersParamsInterface';



export class UserRepositoryImpl implements UserRepository {
  async getInfo(): Promise<UserApiResponse> {
    try {
      const response = await getUserProfile();

      return response;
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
    private?: boolean;
  }): Promise<UserApiResponse> {
    console.log('Updating user profile with data:', userData);
    try {
      const response = await updateUserProfile(userData);

      return response;
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

      if (response.statusCode === 200) {
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

  async softDelete(): Promise<void> {
    console.log('Soft deleting user...');
    try {
      const response = await changePassword({ oldPassword: '', newPassword: '' });
      console.log('softDelete response:', response);

      if (response.status === 200) {
        console.log('User soft deleted successfully');
        return;
      } else {
        throw new Error('Failed to soft delete user');
      }
    } catch (error) {
      console.error('Failed to soft delete user:', error);
      throw new Error('Failed to soft delete user');
    }
  }

  async getUsers(params?: GetUsersParams): Promise<any> {
    console.log('Fetching all users with params:', params);
    try {
      const response = await getUsers(params);

      if (response.statusCode === 200) {
        return response;
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUserById(userId: string): Promise<any> {
    console.log('Fetching user by ID:', userId);
    try {
      const response = await getUserByIdApi(userId);
      console.log('getUserById response:', response);
      if (response.statusCode === 200) {
        return response;
      }
      throw new Error('Failed to fetch user by ID');
    } catch (error) {
      console.error('Failed to fetch user by ID:', error);
      throw new Error('Failed to fetch user by ID');
    }
  }

  async uploadProfilePicture(imageFile: FormData): Promise<UserApiResponse> {
    try {
      const response = await uploadProfilePicture(imageFile);
      return response;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  }
}
