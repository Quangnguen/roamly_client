import { authorizedRequest } from '../../utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api';
import { getAccessToken } from '@/src/utils/tokenStorage';
import { UserChangePasswordInterface, UserUpdateInterface } from '@/src/types/UserUpdateInterface';


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
  console.log('change acc', userData);

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

export const getUsers = async () => {
  return await authorizedRequest(`${API_BASE_URL}/users/get-users`, {
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