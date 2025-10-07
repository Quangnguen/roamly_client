import { authorizedRequest } from '../../utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api';
import { getAccessToken } from '@/src/utils/tokenStorage';
import { UserChangePasswordInterface, UserUpdateInterface } from '@/src/types/UserUpdateInterface';
import { SearchUserParams } from '@/src/types/UserResponseInterface';


// Lấy thông tin người dùng hiện tại
export const getUserProfile = async () => {
  return await authorizedRequest(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData: UserUpdateInterface) => {

  return await authorizedRequest(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

// Xóa mềm tài khoản người dùng
export const softDeleteUser = async () => {
  return await authorizedRequest(`${API_BASE_URL}/users/soft-delete`, {
    method: 'PATCH',
  });
};

// Đổi mật khẩu
export const changePassword = async (passwordData: UserChangePasswordInterface) => {
  return await authorizedRequest(`${API_BASE_URL}/users/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
};



// Bỏ theo dõi người dùng khác
export const unfollowUser = async (targetUserId: string) => {
  return await authorizedRequest(`${API_BASE_URL}/users/unfollow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetUserId }),
  });
};

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any; // cho phép thêm các param khác
}

export const getUsers = async (params?: GetUsersParams) => {
  // Tạo query string từ params
  const queryString = params
    ? '?' + Object.entries(params)
      .filter(([_, value]) => value !== undefined) // lọc bỏ các giá trị undefined
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&')
    : '';

  return await authorizedRequest(`${API_BASE_URL}/users/get-users${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const getUserById = async (userId: string) => {
  return await authorizedRequest(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Upload ảnh đại diện
export const uploadProfilePicture = async (imageFile: FormData) => {
  return await authorizedRequest(`${API_BASE_URL}/users/profile-pic`, {
    method: 'PATCH',
    body: imageFile,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Search users API
export const searchUserApi = async (params: SearchUserParams) => {
  const queryString = new URLSearchParams({
    q: params.q,
    ...(params.page && { page: params.page.toString() }),
    ...(params.limit && { limit: params.limit.toString() }),
  }).toString();

  return await authorizedRequest(`${API_BASE_URL}/users/search?${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

