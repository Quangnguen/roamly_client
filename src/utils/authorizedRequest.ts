import { refreshAccessToken } from '../data/api/refreshToken';

export const authorizedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const accessToken = await refreshAccessToken();

    console.log('Access Token:', accessToken);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in authorized request:', error);
    throw error;
  }
};