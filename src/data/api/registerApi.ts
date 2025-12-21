import { API_BASE_URL } from "@/src/const/api";
import { setToken, setRefreshToken } from '../../utils/tokenStorage';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phoneNumber: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const registerApi = async (
  email: string,
  password: string,
  name: string,
  username: string,
  phoneNumber: string,
  otp: string
): Promise<AuthResponse> => {

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        username,
        phoneNumber,
        otp
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { message: text };
      }
      throw new Error(errorData.message || 'Đăng ký thất bại');
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
        phoneNumber: data.user.phoneNumber,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Email hoặc tên đăng nhập đã tồn tại')) {
        throw new Error('Email hoặc tên đăng nhập đã tồn tại');
      }
      throw error;
    }
    throw new Error('Đã xảy ra lỗi khi đăng ký');
  }
};