import { authorizedRequest } from '@/src/utils/authorizedRequest';
import { API_BASE_URL } from '../../const/api'
import { setToken, setRefreshToken, clearTokens } from '../../utils/tokenStorage'
import { getDeviceInfo, DeviceInfo } from '../../utils/deviceInfo';

// Response khi cần xác thực 2FA
export interface TwoFactorRequiredResponse {
  requiresTwoFactor: true;
  email: string;
  message: string;
}

// Response khi đăng nhập thành công
export interface LoginSuccessResponse {
  requiresTwoFactor: false;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    phoneNumber?: string;
    profilePic?: string;
    followersCount?: number;
    followingCount?: number;
    postCount?: number;
    private?: boolean;
    verified?: boolean;
    role?: number;
    bio?: string;
    unreadNotifications?: number;
  };
}

export type LoginApiResponse = TwoFactorRequiredResponse | LoginSuccessResponse;

/**
 * API đăng nhập - hỗ trợ 2FA cho thiết bị lạ
 */
export const loginApi = async (email: string, password: string): Promise<LoginApiResponse> => {
  try {
    // Lấy thông tin thiết bị
    const deviceInfo = await getDeviceInfo();
    console.log('🔐 [loginApi] Device info:', deviceInfo);
    console.log('🔐 [loginApi] Calling API:', `${API_BASE_URL}/auth/login`);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        deviceInfo,
      }),
    });
    console.log('🔐 [loginApi] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Đăng nhập thất bại..');
    }

    const data = await response.json();

    // Kiểm tra xem có yêu cầu 2FA không
    if (data.requiresTwoFactor) {
      console.log('🔐 [loginApi] 2FA required for new device');
      return {
        requiresTwoFactor: true,
        email: data.email,
        message: data.message,
      };
    }

    // Đăng nhập thành công - lưu tokens
    await setToken(data.access_token);
    await setRefreshToken(data.refresh_token);

    return {
      requiresTwoFactor: false,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        name: data.user.name,
        phoneNumber: data.user.phoneNumber || '',
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

/**
 * API xác thực 2FA
 */
export const verifyTwoFactorApi = async (
  email: string,
  otp: string,
  trustDevice: boolean = true
): Promise<LoginSuccessResponse> => {
  try {
    // Lấy thông tin thiết bị
    const deviceInfo = await getDeviceInfo();
    console.log('🔐 [verifyTwoFactorApi] Verifying 2FA for:', email);

    const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        deviceInfo,
        trustDevice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Xác thực thất bại');
    }

    const data = await response.json();

    // Lưu tokens
    await setToken(data.access_token);
    await setRefreshToken(data.refresh_token);

    return {
      requiresTwoFactor: false,
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
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi xác thực');
  }
};

/**
 * API gửi lại OTP cho 2FA
 */
export const resendTwoFactorOtpApi = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-2fa-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gửi lại OTP thất bại');
    }

    return await response.json();
  } catch (error) {
    throw error instanceof Error ? error : new Error('Đã xảy ra lỗi khi gửi OTP');
  }
};

/**
 * API đăng xuất
 */
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