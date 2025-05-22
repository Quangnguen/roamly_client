import { saveTokens, getTokens, clearTokens } from '../../utils/tokenStorage';

export const refreshAccessToken = async () => {

  const { accessToken, refreshToken, tokenExpiry } = await getTokens();

  // Kiểm tra nếu token đã hết hạn
  if (tokenExpiry && Date.now() > tokenExpiry) {
    try {
      const response = await fetch('http://192.168.100.236:3000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Làm mới token thất bại');
      }

      const data = await response.json();

      await saveTokens(data.access_token, data.refresh_token, 12 * 60 * 60); // Lưu token mới (12 giờ)
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await clearTokens(); // Xóa token nếu làm mới thất bại
      throw error;
    }
  }

  return accessToken;
};
