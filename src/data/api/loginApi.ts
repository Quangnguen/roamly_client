// export const loginApi = async (email: string, password: string) => {
//   try {
//     const response = await fetch('http://192.168.0.101:3000/auth/login', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         email,
//         password,
//       }),
//     });

//     console.log('login api', 4);

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error('Đăng nhập thất bại..');
//     }

//     const data = await response.json();
//     return {
//       access_token: data.access_token,
//       refresh_token: data.refresh_token,
//       user: {
//         id: data.user.id,
//         email: data.user.email,
//         username: data.user.username,
//         name: data.user.name,
//       },
//     };
//   } catch (error) {
//     if (error instanceof Error && error.message.includes('Thông tin đăng nhập không hợp lệ')) {
//       throw new Error('Email hoặc mật khẩu không đúng');
//     }
//     throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng nhập');
//   }
// };

export const loginApi = async (email: string, password: string) => {
  try {
    // Mock credentials for testing
    const mockEmail = 'nam';
    const mockPassword = '123';

    if (email === mockEmail && password === mockPassword) {
      // Mock response data
      return {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        user: {
          id: '1',
          email: mockEmail,
          username: 'testuser',
          name: 'Test User',
        },
      };
    } else {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi đăng nhập');
  }
};