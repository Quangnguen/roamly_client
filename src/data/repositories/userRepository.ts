import { GetUsersParams } from '@/src/types/GetUsersParamsInterface';
import { UserApiResponse, SearchUserParams, SearchUserResponse } from '@/src/types/UserResponseInterface';


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
  getUsers(params?: GetUsersParams): Promise<any>;
  getUserById(userId: string): Promise<UserApiResponse>;
  uploadProfilePicture(imageFile: FormData): Promise<UserApiResponse>;
  searchUsers(params: SearchUserParams): Promise<SearchUserResponse>;
}
