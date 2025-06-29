import { refreshAccessToken } from '../data/api/refreshToken';

export const authorizedRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const accessToken = await refreshAccessToken();

    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('Request failed with status:', response.status, 'Error:', errorText);
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in authorized request:', error);
    throw error;
  }
};