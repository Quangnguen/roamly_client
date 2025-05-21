import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dependencies } from '../../../dependencies/dependencies';
import { User } from '../../../domain/models/User';
import { UserApiResponse } from '@/src/types/UserResponseInterface';

// Define the shape of the user state
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  status: string | null;
  statusCode?: number | null; // Thêm dòng này
  users: User[] | null; // Thêm dòng này
  profile: User | null; // Thêm dòng này
}
 
// Initial state
const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  message: null,
  status: null,
  statusCode: null, // Thêm dòng này
  users: null, // Thêm dòng này
  profile: null, // Thêm dòng này
};

// Fetch user profile thunk
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (_: void, thunkAPI) => {
    try {
      const response = await dependencies.userUsecase.getInfo();
      console.log('fetchUserProfile response:', response);
      return response as UserApiResponse; // Chuyển đổi kiểu dữ liệu

    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (userId: string, thunkAPI) => {
    try {
      console.log('userId:', userId);
      const response = await dependencies.userUsecase.getUserById(userId);
      return response as UserApiResponse; // Chuyển đổi kiểu dữ liệu
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
      private?: boolean;
    },
    thunkAPI
  ) => {
    try {
      const response = await dependencies.userUsecase.updateInfo(userData);
      console.log('updateUserProfile response userslice:', response);
      return response as UserApiResponse; // Chuyển đổi kiểu dữ liệu
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

export const softDelete = createAsyncThunk(
  'user/softDelete',
  async (userId: string, thunkAPI) => {
    try {
      const response = await dependencies.userUsecase.softDelete();
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to soft delete user');
    }
  }
);

export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (_: void, thunkAPI) => {
    try {
      const response = await dependencies.userUsecase.getUsers();
      console.log('getUsers response:', response);
      return response;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to get users');
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
    clearMessage: (state) => {
      state.message = null;
      state.status = null;
      state.statusCode = null; // Thêm dòng này
    }
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
        state.profile = action.payload.data ?? null;
        state.message = action.payload.message; // Cập nhật message từ action.payload.message
        state.status = action.payload.status; // Cập nhật status từ action.payload.status
        state.statusCode = action.payload.statusCode; // Cập nhật statusCode từ action.payload.statusCode
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
        state.user = action.payload.data ?? null; // Cập nhật user từ action.payload.data
        state.message = action.payload.message; // Cập nhật message từ action.payload.message 
        state.status = action.payload.status; // Cập nhật status từ action.payload.status
        state.statusCode = action.payload.statusCode; // Cập nhật statusCode từ action.payload.statusCode
        
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

    // Soft delete cases
    builder
      .addCase(softDelete.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(softDelete.fulfilled, (state) => {
        state.loading = false;
        state.message = 'Tài khoản của bạn sẽ bị xóa sau 30 ngày';
      })
      .addCase(softDelete.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Get users cases
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data; // <-- phải là .data
        state.message = action.payload.message; // Cập nhật message từ action.payload.message 
        state.status = action.payload.status; // Cập nhật status từ action.payload.status
        state.statusCode = action.payload.statusCode; // Cập nhật statusCode từ action.payload.statusCode
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
    
    // Get user by ID cases
    builder
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data ?? null;
        state.message = action.payload.message;
        state.status = action.payload.status;
        state.statusCode = action.payload.statusCode;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        // Chỉ set user về null nếu thực sự không tìm thấy user (404)
        if (action.payload && typeof action.payload === 'string' && action.payload.includes('not found')) {
          state.user = null;
        }
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearUser, clearMessage } = userSlice.actions;

// Export reducer
export default userSlice.reducer;