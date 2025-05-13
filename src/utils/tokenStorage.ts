import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Lưu token
export const saveTokens = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  const expiryTime = Date.now() + expiresIn * 1000; // Thời gian hết hạn (ms)
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
    [TOKEN_EXPIRY_KEY, expiryTime.toString()],
  ]);
};

// Lấy token
export const getTokens = async () => {
  const tokens = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
  return {
    accessToken: tokens[0][1],
    refreshToken: tokens[1][1],
    tokenExpiry: tokens[2][1] ? parseInt(tokens[2][1], 10) : null,
  };
};

// Xóa token
export const clearTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
};