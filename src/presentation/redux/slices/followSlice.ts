import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dependencies } from "../../../dependencies/dependencies";
import { User } from "../../../domain/models/User";
import { FollowingResponseInterface } from "@/src/types/FollowingResponseInterface";

interface FollowState {
    loading: boolean;
    error: string | null;
    message: string | null;
    status: string | null;
    statusCode?: number | null;
    followers: FollowingResponseInterface[] | null;
    following: FollowingResponseInterface[] | null;
}

const initialState: FollowState = {
    loading: false,
    error: null,
    message: null,
    status: null,
    statusCode: null,
    followers: null,
    following: null,
};

// Follow user thunk
export const followUser = createAsyncThunk(
    'follow/followUser',
    async (userId: string, thunkAPI) => {
        try {
            const response = await dependencies.followUsecase.followUser(userId);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể theo dõi người dùng này');
        }
    }
);

// Unfollow user thunk
export const unfollowUser = createAsyncThunk(
    'follow/unfollowUser',
    async (userId: string, thunkAPI) => {
        try {
            const response = await dependencies.followUsecase.unfollowUser(userId);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể hủy theo dõi người dùng này');
        }
    }
);

// Get followers thunk
export const getFollowers = createAsyncThunk(
    'follow/getFollowers',
    async (_, thunkAPI) => {
        try {
            const response = await dependencies.followUsecase.getFollowers();
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể lấy danh sách người theo dõi');
        }
    }
);

// Get following thunk
export const getFollowing = createAsyncThunk(
    'follow/getFollowing',
    async (_: void, thunkAPI) => {
        try {
            const response = await dependencies.followUsecase.getFollowing();
            console.log('response', response);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể lấy danh sách đang theo dõi');
        }
    }
);

export const followSlice = createSlice({
    name: 'follow',
    initialState,
    reducers: {
        clearFollowState: (state) => {
            state.message = null;
            state.status = null;
            state.statusCode = null;
        }
    },
    extraReducers: (builder) => {
        // Follow user cases
        builder
            .addCase(followUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(followUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
            })
            .addCase(followUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Unfollow user cases
        builder
            .addCase(unfollowUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unfollowUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
                state.status = action.payload.status;
                state.statusCode = action.payload.statusCode;
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Get followers cases
        builder
            .addCase(getFollowers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFollowers.fulfilled, (state, action) => {
                state.loading = false;
                state.followers = action.payload as FollowingResponseInterface[];
                // state.message = action.payload.message;
                // state.status = action.payload.status;
                // state.statusCode = action.payload.statusCode;
            })
            .addCase(getFollowers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Get following cases
        builder
            .addCase(getFollowing.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFollowing.fulfilled, (state, action) => {
                state.loading = false;
                state.following = action.payload as FollowingResponseInterface[];
                // state.message = action.payload.message;
                // state.status = action.payload.status;
                // state.statusCode = action.payload.statusCode;
            })
            .addCase(getFollowing.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearFollowState } = followSlice.actions;

export default followSlice.reducer;
