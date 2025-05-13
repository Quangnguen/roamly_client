import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dependencies } from '../../../dependencies/dependencies';
import { User } from '../../../domain/models/User';

// Define the shape of the user state
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (id: string, thunkAPI) => {
    try {
      const response = await dependencies.userUsecase.getInfo(id);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

// Update user profile thunk
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (
    userData: {
      name?: string;
      email?: string;
      username?: string;
      bio?: string;
      profilePic?: string;
      privateAccount?: boolean;
    },
    thunkAPI
  ) => {
    try {
      const response = await dependencies.userUsecase.updateInfo(userData);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to update user profile');
    }
  }
);

// Update password thunk
export const updatePassword = createAsyncThunk(
  'user/updatePassword',
  async (
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    thunkAPI
  ) => {
    try {
      await dependencies.userUsecase.updatePassword(oldPassword, newPassword);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to update password');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch user profile cases
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update user profile cases
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update password cases
    builder
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;