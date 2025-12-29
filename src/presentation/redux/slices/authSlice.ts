import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { dependencies } from "../../../dependencies/dependencies";
import { clearTokens } from "@/src/utils/tokenStorage";
import { socketService } from "@/src/services/socketService";
import { loginApi, verifyTwoFactorApi, LoginApiResponse, LoginSuccessResponse } from "../../../data/api/loginApi";

// Define the shape of the nested user data
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phoneNumber?: string;
  profilePic?: string;
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
  private?: boolean;
  verified?: boolean;
  role?: number;
  bio?: string;
  unreadNotifications?: number;
}

// Define the state shape
interface AuthState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  access_token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  // 2FA states
  requiresTwoFactor: boolean;
  twoFactorEmail: string | null;
  twoFactorMessage: string | null;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Initial state
const initialState: AuthState = {
  profile: null,
  loading: false,
  error: null,
  access_token: null,
  refreshToken: null,
  isAuthenticated: false,
  // 2FA initial states
  requiresTwoFactor: false,
  twoFactorEmail: null,
  twoFactorMessage: null,
};

// Login thunk - now handles 2FA and Account Lockout
export const login = createAsyncThunk<
  LoginApiResponse,
  { email: string; password: string },
  { rejectValue: { message: string; isAccountLocked?: boolean; retryAfter?: number; lockoutLevel?: string } }
>(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await loginApi(email, password);
      return response;
    } catch (err: any) {
      // Xử lý Account Locked error
      if (err.isAccountLocked) {
        return thunkAPI.rejectWithValue({
          message: err.message,
          isAccountLocked: true,
          retryAfter: err.retryAfter,
          lockoutLevel: err.lockoutLevel,
        });
      }
      return thunkAPI.rejectWithValue({ message: err.message || "Đăng nhập thất bại" });
    }
  }
);

// Verify Two Factor thunk
export const verifyTwoFactor = createAsyncThunk<
  LoginSuccessResponse,
  { email: string; otp: string; trustDevice: boolean },
  { rejectValue: string }
>(
  "auth/verifyTwoFactor",
  async ({ email, otp, trustDevice }, thunkAPI) => {
    try {
      const response = await verifyTwoFactorApi(email, otp, trustDevice);
      return response;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Xác thực thất bại");
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  "auth/register",
  async (
    { email, password, name, username, phoneNumber, otp }: { email: string; password: string; name: string; username: string; phoneNumber: string; otp: string },
    thunkAPI
  ) => {
    try {
      const response = await dependencies.registerUseCase.execute(email, password, name, username, phoneNumber, otp);
      return response as unknown as AuthResponse;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Đăng ký thất bại");
    }
  }
);

// Logout thunk với navigation và cleanup
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {

      // 1. Call API logout if available
      try {
        await dependencies.loginUseCase.logout();
      } catch (apiError) {
        console.warn('API logout failed, continuing with local logout:', apiError);
      }

      // 2. Clear tokens
      await clearTokens();

      // 3. Disconnect socket
      if (socketService) {
        socketService.disconnect();
      }

      // 4. Clear any other app data
      dispatch({ type: 'comment/clearComments' });
      dispatch({ type: 'post/clearPosts' });


      return true;
    } catch (error) {
      console.error('❌ Error during logout:', error);
      throw error;
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateAuthProfile: (state, action) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Thêm reducer để cập nhật trạng thái isAuthenticated
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    // Thêm reducer để tăng số thông báo chưa đọc
    incrementUnreadNotifications: (state) => {
      if (state.profile) {
        state.profile.unreadNotifications = (state.profile.unreadNotifications || 0) + 1;
      }
    },

    // Thêm reducer để giảm số thông báo chưa đọc
    decrementUnreadNotifications: (state) => {
      if (state.profile && (state.profile.unreadNotifications ?? 0) > 0) {
        state.profile.unreadNotifications = (state.profile.unreadNotifications ?? 0) - 1;
      }
    },

    // Thêm reducer để reset số thông báo chưa đọc về 0
    resetUnreadNotifications: (state) => {
      if (state.profile) {
        state.profile.unreadNotifications = 0;
      }
    },

    // Reset 2FA state
    resetTwoFactorState: (state) => {
      state.requiresTwoFactor = false;
      state.twoFactorEmail = null;
      state.twoFactorMessage = null;
    },

    // Immediate logout (không cần async)
    logoutImmediate: (state) => {
      state.isAuthenticated = false;
      state.profile = null;
      state.access_token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
      state.requiresTwoFactor = false;
      state.twoFactorEmail = null;
      state.twoFactorMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases - with 2FA support
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.requiresTwoFactor = false;
        state.twoFactorEmail = null;
        state.twoFactorMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;

        // Check if 2FA is required
        if (action.payload.requiresTwoFactor) {
          state.requiresTwoFactor = true;
          state.twoFactorEmail = action.payload.email;
          state.twoFactorMessage = action.payload.message;
          state.isAuthenticated = false;
        } else {
          // Login successful
          state.profile = action.payload.user as User;
          state.access_token = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
          state.isAuthenticated = true;
          state.requiresTwoFactor = false;
          state.twoFactorEmail = null;
          state.twoFactorMessage = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Đăng nhập thất bại';
        state.isAuthenticated = false;
        state.requiresTwoFactor = false;
      });

    // Verify Two Factor cases
    builder
      .addCase(verifyTwoFactor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTwoFactor.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user as User;
        state.access_token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.requiresTwoFactor = false;
        state.twoFactorEmail = null;
        state.twoFactorMessage = null;
      })
      .addCase(verifyTwoFactor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Keep 2FA state so user can retry
      });

    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.profile = null;
        state.access_token = null;
        state.refreshToken = null;
        state.error = null;
        state.requiresTwoFactor = false;
        state.twoFactorEmail = null;
        state.twoFactorMessage = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Logout failed';
        // Vẫn logout dù có lỗi
        state.isAuthenticated = false;
        state.profile = null;
        state.access_token = null;
        state.refreshToken = null;
      });
  },
});

// Export actions
export const {
  updateAuthProfile,
  setIsAuthenticated,
  incrementUnreadNotifications,
  decrementUnreadNotifications,
  resetUnreadNotifications,
  resetTwoFactorState,
  logoutImmediate
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;