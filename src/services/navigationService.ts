import { router } from 'expo-router';

// ✅ Sử dụng Expo Router thay vì createNavigationContainerRef
export function navigate(name: string, params?: any) {
  try {
    if (params) {
      router.push({ pathname: name, params });
    } else {
      router.push(name);
    }
  } catch (error) {
    console.error('❌ Navigation error:', error);
  }
}

export function replace(name: string, params?: any) {
  try {
    if (params) {
      router.replace({ pathname: name, params });
    } else {
      router.replace(name);
    }
  } catch (error) {
    console.error('❌ Replace navigation error:', error);
  }
}

export function goBack() {
  try {
    router.back();
  } catch (error) {
    console.error('❌ Go back error:', error);
  }
}

// ✅ Navigate to login using Expo Router
export function navigateToLogin() {
  try {
    router.replace('/login'); // Thay bằng route thực tế
  } catch (error) {
    console.error('❌ Navigate to login error:', error);
  }
}

// ✅ Navigate to main app
export function navigateToMain() {
  try {
    router.replace('/'); // Hoặc route main của bạn
  } catch (error) {
    console.error('❌ Navigate to main error:', error);
  }
}