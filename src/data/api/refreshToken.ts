import { saveTokens, getTokens, clearTokens } from '../../utils/tokenStorage';
import { store } from '../../presentation/redux/store';
import { logout } from '../../presentation/redux/slices/authSlice';
import { navigateToLogin } from '../../services/navigationService';

export const refreshAccessToken = async () => {
  const { accessToken, refreshToken, tokenExpiry } = await getTokens();


  // ✅ Kiểm tra nếu không có access token - logout và chuyển về login
  if (!accessToken) {
    console.error('❌ No access token found - logging out user');
    await handleLogoutFlow();
    throw new Error('No access token available');
  }

  // Kiểm tra nếu token đã hết hạn
  if (tokenExpiry && Date.now() > tokenExpiry) {

    if (!refreshToken) {
      console.error('❌ No refresh token available for refresh - logging out user');
      await handleLogoutFlow();
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
        console.error('❌ Refresh token failed with status:', response.status);
        await handleLogoutFlow();
        throw new Error('Làm mới token thất bại');
      }

      const data = await response.json();
      
      // ✅ Kiểm tra response structure
      if (!data.success || !data.data) {
        console.error('❌ Invalid refresh response structure');
        await handleLogoutFlow();
        throw new Error('Invalid refresh response');
      }

      const { access_token, refresh_token, expires_in } = data.data;
      
      await saveTokens(access_token, refresh_token, expires_in);
      return access_token;
      
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      await handleLogoutFlow();
      throw error;
    }
  }

  return accessToken;
};

// ✅ Helper function để handle logout flow
const handleLogoutFlow = async () => {
  try {
    // 1. Clear tokens
    await clearTokens();
    
    // 2. Dispatch logout action
    store.dispatch(logout());
    
    // 3. Navigate to login screen
    setTimeout(() => {
      navigateToLogin();
    }, 100); // Small delay to ensure state is updated
    
    
  } catch (error) {
    console.error('❌ Error during logout flow:', error);
  }
};
