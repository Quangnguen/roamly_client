import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { likeApi, unlikeApi } from '@/src/data/api/likeApi';

interface LikeState {
    loading: boolean;
    error: string | null;
    likedPosts: string[];
}

const initialState: LikeState = {
    loading: false,
    error: null,
    likedPosts: []
};

export const likePost = createAsyncThunk(
    'like/likePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await likeApi(postId, 'post');
            return { postId, response };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to like post');
        }
    }
);

export const unlikePost = createAsyncThunk(
    'like/unlikePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await unlikeApi(postId, 'post');
            return { postId, response };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to unlike post');
        }
    }
);

const likeSlice = createSlice({
    name: 'like',
    initialState,
    reducers: {
        initializeLikeStatus: (state, action) => {
            // Khởi tạo trạng thái like từ props
            const { postId, isLiked } = action.payload;
            if (isLiked && !state.likedPosts.includes(postId)) {
                state.likedPosts.push(postId);
            } else if (!isLiked && state.likedPosts.includes(postId)) {
                state.likedPosts = state.likedPosts.filter(id => id !== postId);
            }
        },
        clearLikeState: (state) => {
            state.likedPosts = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Like post
            .addCase(likePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                state.loading = false;
                if (!state.likedPosts.includes(action.payload.postId)) {
                    state.likedPosts.push(action.payload.postId);
                }
            })
            .addCase(likePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi thích bài viết';
            })
            // Unlike post
            .addCase(unlikePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                state.loading = false;
                state.likedPosts = state.likedPosts.filter(id => id !== action.payload.postId);
            })
            .addCase(unlikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi bỏ thích bài viết';
            });
    }
});

export const { initializeLikeStatus, clearLikeState } = likeSlice.actions;

export default likeSlice.reducer;
