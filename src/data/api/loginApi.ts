import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api'
import { saveTokens } from '../../utils/tokenStorage'


export const loginApi = async (email: string, password: string) => {
  console.log('login api:', email, password)
  try {
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


    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData', errorData);
      throw new Error('Đăng nhập thất bại..', errorData.message);
    }

    const data = await response.json();
    await saveTokens(data.access_token, data.refresh_token, 12 * 60 * 60); // Lưu token (12 giờ)
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
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Thông tin đăng nhập không hợp lệ')) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng nhập');
  }
};

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

export const logoutApi = async () => {
  try {
    const response = await authorizedRequest(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Xóa token sau khi đăng xuất
    await saveTokens('', '', 0); // Xóa token

    if (!response.ok) {
      const errorData = await response.json();
      console.log('errorData', errorData);
      throw new Error('Đăng xuất thất bại..', errorData.message);
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