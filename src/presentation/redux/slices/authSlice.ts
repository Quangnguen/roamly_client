import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dependencies } from "../../../dependencies/dependencies";
import { is } from "date-fns/locale";

// Define the shape of the nested user data
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  phoneNumber: string;
  profilePic: string;
  followersCount: number;
  followingCount: number;
  postCount: number;
  private: boolean;
  verified: boolean;
  role: string;
  bio: string;
}


// Define the state shape
interface AuthState {
  profile: User | null;
  loading: boolean;
  error: string | null;
  access_token: string | null; // Thêm access_token
  refreshToken: string | null; // Thêm refreshToken
  isAuthenticated: boolean; // Thêm isAuthenticated
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
  access_token: null, // Khởi tạo access_token
  refreshToken: null, // Khởi tạo refreshToken
  isAuthenticated: false, // Khởi tạo isAuthenticated
};

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await dependencies.loginUseCase.execute(email, password);
      console.log('login thunk:', response);
      return response as unknown as AuthResponse;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Đăng nhập thất bại");
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  "auth/register",
  async (
    { email, password, name, username, phoneNumber }: { email: string; password: string; name: string; username: string; phoneNumber: string },
    thunkAPI
  ) => {
    try {
      const response = await dependencies.registerUseCase.execute(email, password, name, username, phoneNumber);
      return response as unknown as AuthResponse;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Đăng ký thất bại");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const response = await dependencies.loginUseCase.logout();
      return response;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Đăng xuất thất bại");
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
    } 
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.user;
        state.access_token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true; // Cập nhật trạng thái isAuthenticated
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false; // Đặt lại trạng thái isAuthenticated khi đăng nhập thất bại
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
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.access_token = null; // Xóa access_token khi đăng xuất
        state.refreshToken = null; // Xóa refreshToken khi đăng xuất
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { updateAuthProfile } = authSlice.actions;

// Export reducer
export default authSlice.reducer;