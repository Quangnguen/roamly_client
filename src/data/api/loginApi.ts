import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api'
import { setToken, setRefreshToken, clearTokens } from '../../utils/tokenStorage'


export const loginApi = async (email: string, password: string) => {
  try {
    console.log('🔐 [loginApi] Calling API:', `${API_BASE_URL}/auth/login`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    console.log('🔐 [loginApi] Response status:', response.status);


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng nhập thất bại..');
    }

    const data = await response.json();

    // Lưu token vào SecureStore
    await setToken(data.access_token);
    await setRefreshToken(data.refresh_token);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        name: data.user.name,
        profilePic: data.user.profilePic,
        followersCount: data.user.followersCount,
        followingCount: data.user.followingCount,
        postCount: data.user.postCount,
        private: data.user.private,
        verified: data.user.verified,
        role: data.user.role,
        bio: data.user.bio,
        unreadNotifications: data.user.unreadNotifications,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Thông tin đăng nhập không hợp lệ')) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng nhập');
  }
};

export const logoutApi = async () => {
  try {
    const response = await authorizedRequest(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Xóa token sau khi đăng xuất
    await clearTokens();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng xuất thất bại..');
    }

    return response;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng xuất');
  }
}

// export const loginApi = async (email: string, password: string) => {
//   try {
//     // Mock credentials for testing
//     const mockEmail = 'nam';
//     const mockPassword = '123';

//     if (email === mockEmail && password === mockPassword) {
//       // Mock response data
//       return {
//         access_token: 'mock_access_token',
//         refresh_token: 'mock_refresh_token',
//         user: {
//           id: '1',
//           email: mockEmail,
//           username: 'testuser',
//           name: 'Test User',
//         },
//       };
//     } else {
//       throw new Error('Email hoặc mật khẩu không đúng');
//     }
//   } catch (error) {
//     throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng nhập');
//   }
// };