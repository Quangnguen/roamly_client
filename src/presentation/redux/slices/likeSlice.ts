import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dependencies } from '@/src/dependencies/dependencies';

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
            const response = await dependencies.likeUsecase.like(postId, 'post');
            return { postId, response };
        } catch (error: any) {
            console.error('❌ [LIKE_SLICE] Like API call failed:', error);
            return rejectWithValue(error.message || 'Failed to like post');
        }
    }
);

export const unlikePost = createAsyncThunk(
    'like/unlikePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await dependencies.likeUsecase.unlike(postId, 'post');
            return { postId, response };
        } catch (error: any) {
            console.error('❌ [LIKE_SLICE] Unlike API call failed:', error);
            return rejectWithValue(error.message || 'Failed to unlike post');
        }
    }
);

const likeSlice = createSlice({
    name: 'like',
    initialState,
    reducers: {
        initializeLikeStatus: (state, action) => {
            const { postId, isLiked } = action.payload;
            if (isLiked && !state.likedPosts.includes(postId)) {
                state.likedPosts.push(postId);
            } else if (!isLiked && state.likedPosts.includes(postId)) {
                state.likedPosts = state.likedPosts.filter(id => id !== postId);
            }
        },

        // Socket event handlers
        handleSocketPostLiked: (state, action) => {
            const { postId, userId } = action.payload;

            if (!state.likedPosts.includes(postId)) {
                state.likedPosts.push(postId);
            } 
        },

        handleSocketPostUnliked: (state, action) => {
            const { postId, userId } = action.payload;

            const oldLength = state.likedPosts.length;
            state.likedPosts = state.likedPosts.filter(id => id !== postId);
            const newLength = state.likedPosts.length;

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
                } else {
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
                const oldLength = state.likedPosts.length;
                state.likedPosts = state.likedPosts.filter(id => id !== action.payload.postId);
                const newLength = state.likedPosts.length;
            })
            .addCase(unlikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi bỏ thích bài viết';
            });
    }
});

// Export actions
export const {
    initializeLikeStatus,
    handleSocketPostLiked,
    handleSocketPostUnliked,
    clearLikeState
} = likeSlice.actions;

// Export reducer
export default likeSlice.reducer;