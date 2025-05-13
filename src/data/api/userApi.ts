import { authorizedRequest } from '../../utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api';


// Lấy thông tin người dùng hiện tại
export const getUserProfile = async (id: string) => {
  return await authorizedRequest(`${API_BASE_URL}/users/me?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (userData: { name?: string; email?: string; username?: string }) => {
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
export const changePassword = async (passwordData: { oldPassword: string; newPassword: string }) => {
  return await authorizedRequest(`${API_BASE_URL}/users/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });
};

// Theo dõi người dùng khác
export const followUser = async (targetUserId: string) => {
  return await authorizedRequest(`${API_BASE_URL}/users/follow`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetUserId }),
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