import { getToken, getRefreshToken, setToken, setRefreshToken, clearTokens } from '../../utils/tokenStorage';
import { store } from '../../presentation/redux/store';
import { logout } from '../../presentation/redux/slices/authSlice';
import { navigateToLogin } from '../../services/navigationService';
import { API_BASE_URL } from '../../const/api';

export const refreshAccessToken = async () => {
  const accessToken = await getToken();
  const refreshToken = await getRefreshToken();

  // ✅ Kiểm tra nếu không có access token - logout và chuyển về login
  if (!accessToken) {
    console.error('❌ No access token found - logging out user');
    await handleLogoutFlow();
    throw new Error('No access token available');
  }

  // Note: Token expiry check removed as we no longer store expiry time in SecureStore.
  // Proactive refresh is disabled. Rely on 401 interceptors or manual refresh if needed.
  
  // If you need to force refresh, you can implement a separate function or logic here.
  // For now, we just return the current access token.

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
