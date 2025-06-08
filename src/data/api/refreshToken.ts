import { saveTokens, getTokens, clearTokens } from '../../utils/tokenStorage';

export const refreshAccessToken = async () => {
  const { accessToken, refreshToken, tokenExpiry } = await getTokens();

  console.log('Token check - Access Token exists:', !!accessToken);
  console.log('Token check - Refresh Token exists:', !!refreshToken);
  console.log('Token check - Token Expiry:', tokenExpiry ? new Date(tokenExpiry).toISOString() : 'No expiry');
  console.log('Token check - Current time:', new Date().toISOString());

  // Kiểm tra nếu không có access token
  if (!accessToken) {
    console.error('No access token found');
    throw new Error('No access token available');
  }

  // Kiểm tra nếu token đã hết hạn
  if (tokenExpiry && Date.now() > tokenExpiry) {
    console.log('Token expired, attempting to refresh...');

    if (!refreshToken) {
      console.error('No refresh token available for refresh');
      await clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('http://192.168.100.236:3000/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('Refresh token failed with status:', response.status);
        await clearTokens();
        throw new Error('Làm mới token thất bại');
      }

      const data = await response.json();
      console.log('Token refreshed successfully');

      await saveTokens(data.access_token, data.refresh_token, 12 * 60 * 60); // Lưu token mới (12 giờ)
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      await clearTokens(); // Xóa token nếu làm mới thất bại
      throw error;
    }
  }

  console.log('Using existing access token');
  return accessToken;
};
