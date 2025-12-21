import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// SecureStore hoạt động trên iOS và Android. 
// Trên Web, nó không được hỗ trợ, nên cần fallback về AsyncStorage hoặc localStorage.
const isSecureStoreAvailable = Platform.OS !== 'web';

export const setToken = async (token: string) => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync('accessToken', token);
    } else {
      await AsyncStorage.setItem('accessToken', token);
    }
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const getToken = async () => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync('accessToken');
    } else {
      return await AsyncStorage.getItem('accessToken');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync('accessToken');
    } else {
      await AsyncStorage.removeItem('accessToken');
    }
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Thêm các hàm cho Refresh Token (Quan trọng hơn Access Token)
export const setRefreshToken = async (token: string) => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync('refreshToken', token);
    } else {
      await AsyncStorage.setItem('refreshToken', token);
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

export const getRefreshToken = async () => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync('refreshToken');
    } else {
      return await AsyncStorage.getItem('refreshToken');
    }
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const removeRefreshToken = async () => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync('refreshToken');
    } else {
      await AsyncStorage.removeItem('refreshToken');
    }
  } catch (error) {
    console.error('Error removing refresh token:', error);
  }
};

// Hàm clear tất cả token khi logout
export const clearTokens = async () => {
  await removeToken();
  await removeRefreshToken();
};