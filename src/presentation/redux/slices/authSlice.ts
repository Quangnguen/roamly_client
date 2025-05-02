import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dependencies } from "../../../dependencies/dependencies";
import { Alert } from "react-native";

// Define the shape of the nested user data
interface User {
  id: string;
  email: string;
  username: string;
  name: string;
}

// Define the shape of the auth response
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Define the state shape
interface AuthState {
  user: AuthResponse | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Login thunk
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, thunkAPI) => {
    try {
      console.log("login redux", 1)
      const response = await dependencies.loginUseCase.execute(email, password);
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
    { email, password, name, username }: { email: string; password: string; name: string; username: string },
    thunkAPI
  ) => {
    try {
      console.log("register thunk", email, password, name, username);
      const response = await dependencies.registerUseCase.execute(email, password, name, username);
      return response as unknown as AuthResponse;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Đăng ký thất bại");
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
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
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer;