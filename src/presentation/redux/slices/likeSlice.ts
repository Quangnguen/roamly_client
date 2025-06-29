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
            console.log('✅ [LIKE_SLICE] Like API call successful for postId:', postId);
            console.log('✅ [LIKE_SLICE] Like response:', response);
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
            console.log(`🔥 [LIKE_SLICE] Starting unlike request for postId: ${postId}`);
            const response = await dependencies.likeUsecase.unlike(postId, 'post');
            console.log('✅ [LIKE_SLICE] Unlike API call successful for postId:', postId);
            console.log('✅ [LIKE_SLICE] Unlike response:', response);
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
            console.log(`📱 [LIKE_SLICE] Socket: Post ${postId} được like bởi user ${userId}`);
            console.log(`📱 [LIKE_SLICE] Current likedPosts before:`, state.likedPosts);

            if (!state.likedPosts.includes(postId)) {
                state.likedPosts.push(postId);
                console.log(`📱 [LIKE_SLICE] Added ${postId} to likedPosts`);
            } else {
                console.log(`📱 [LIKE_SLICE] Post ${postId} already in likedPosts`);
            }
        },

        handleSocketPostUnliked: (state, action) => {
            const { postId, userId } = action.payload;
            console.log(`📱 [LIKE_SLICE] Socket: Post ${postId} được unlike bởi user ${userId}`);
            console.log(`📱 [LIKE_SLICE] Current likedPosts before:`, state.likedPosts);

            const oldLength = state.likedPosts.length;
            state.likedPosts = state.likedPosts.filter(id => id !== postId);
            const newLength = state.likedPosts.length;

            console.log(`📱 [LIKE_SLICE] Removed ${postId} from likedPosts (${oldLength} -> ${newLength})`);
            console.log(`📱 [LIKE_SLICE] Current likedPosts after:`, state.likedPosts);
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
                console.log('⏳ [LIKE_SLICE] Like post pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                console.log('✅ [LIKE_SLICE] Like post fulfilled for:', action.payload.postId);
                console.log('✅ [LIKE_SLICE] likedPosts before:', state.likedPosts);
                state.loading = false;
                if (!state.likedPosts.includes(action.payload.postId)) {
                    state.likedPosts.push(action.payload.postId);
                    console.log('✅ [LIKE_SLICE] Added to likedPosts:', action.payload.postId);
                } else {
                    console.log('✅ [LIKE_SLICE] Already in likedPosts:', action.payload.postId);
                }
                console.log('✅ [LIKE_SLICE] likedPosts after:', state.likedPosts);
            })
            .addCase(likePost.rejected, (state, action) => {
                console.error('❌ [LIKE_SLICE] Like post rejected:', action.payload);
                state.loading = false;
                state.error = action.payload as string || action.error.message || 'Có lỗi xảy ra khi thích bài viết';
            })
            // Unlike post
            .addCase(unlikePost.pending, (state) => {
                console.log('⏳ [LIKE_SLICE] Unlike post pending');
                state.loading = true;
                state.error = null;
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                console.log('✅ [LIKE_SLICE] Unlike post fulfilled for:', action.payload.postId);
                console.log('✅ [LIKE_SLICE] likedPosts before:', state.likedPosts);
                state.loading = false;
                const oldLength = state.likedPosts.length;
                state.likedPosts = state.likedPosts.filter(id => id !== action.payload.postId);
                const newLength = state.likedPosts.length;
                console.log(`✅ [LIKE_SLICE] Removed from likedPosts: ${action.payload.postId} (${oldLength} -> ${newLength})`);
                console.log('✅ [LIKE_SLICE] likedPosts after:', state.likedPosts);
            })
            .addCase(unlikePost.rejected, (state, action) => {
                console.error('❌ [LIKE_SLICE] Unlike post rejected:', action.payload);
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
