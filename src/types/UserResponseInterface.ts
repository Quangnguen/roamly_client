import { User } from '../domain/models/User';

export interface UserApiResponse {
  data?: User;
  message: string;
  status: string;
  statusCode: number;
  error?: string;
}

// Interface cho user search result
export interface SearchUserResult {
  id: string;
  username: string;
  name: string;
  profilePic: string | null;
  followerCount: number;
  isFollowing: boolean;
}

// Interface cho search user response với pagination
export interface SearchUserResponse {
  message: string;
  statusCode: number;
  data: {
    currentPage: number;
    total: number;
    totalPages: number;
    results: SearchUserResult[];
  };
}

// Interface cho search user params
export interface SearchUserParams {
  q: string;
  page?: number;
  limit?: number;
}

