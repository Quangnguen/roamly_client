import { API_BASE_URL } from "@/src/const/api";

export const sendOtpApi = async (email: string, type: 'REGISTER' | 'FORGOT_PASSWORD') => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { message: text };
      }
      throw new Error(errorData.message || 'Gửi OTP thất bại');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
