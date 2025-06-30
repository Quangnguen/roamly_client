import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { dependencies } from "../../../dependencies/dependencies";
import { CommentResponseInterface } from "@/src/types/responses/CommentResponseInterface";

interface CommentState {
    loading: boolean;
    error: string | null;
    message: string | null;
    status: string | null;
    statusCode?: number | null;
    comments: CommentResponseInterface[] | null;
    currentComment: CommentResponseInterface | null;
    countComments?: number; // Optional, to keep track of the number of comments
}
interface responseData {
    message: string;
    status: string;
    statusCode?: number;
    data?: CommentResponseInterface[]; // Data can be a single comment or an array of comments
}

const initialState: CommentState = {
    loading: false,
    error: null,
    message: null,
    status: null,
    statusCode: null,
    comments: null,
    currentComment: null,
    countComments: 0, // Initialize countComments to 0
};

// Create comment thunk
export const createComment = createAsyncThunk(
    'comment/createComment',
    async (params: { postId: string; content: string; parentId?: string }, thunkAPI) => {
        try {
            const response = await dependencies.commentUsecase.createComment(
                params.postId,
                params.content,
                params.parentId
            );
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể tạo bình luận');
        }
    }
);

// Get comments thunk
export const getComments = createAsyncThunk(
    'comment/getComments',
    async (postId: string, thunkAPI) => {
        try {
            const response = await dependencies.commentUsecase.getComments(postId);
            console.log('Comments fetched:', response);
            return response as unknown as responseData; // Assuming the response is of type responseData
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể lấy danh sách bình luận');
        }
    }
);

// Delete comment thunk
export const deleteComment = createAsyncThunk(
    'comment/deleteComment',
    async (commentId: string, thunkAPI) => {
        try {
            const response = await dependencies.commentUsecase.deleteComment(commentId);
            return response;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể xóa bình luận');
        }
    }
);

// Like comment thunk
export const likeComment = createAsyncThunk(
    'comment/likeComment',
    async (commentId: string, thunkAPI) => {
        try {
            const response = await dependencies.likeUsecase.like(commentId, 'comment');
            return { commentId, ...response };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể thích bình luận');
        }
    }
);

// Unlike comment thunk
export const unlikeComment = createAsyncThunk(
    'comment/unlikeComment',
    async (commentId: string, thunkAPI) => {
        try {
            const response = await dependencies.likeUsecase.unlike(commentId, 'comment');
            return { commentId, ...response };
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message || 'Không thể bỏ thích bình luận');
        }
    }
);

export const commentSlice = createSlice({
    name: 'comment',
    initialState,
    reducers: {
        clearCommentState: (state) => {
            state.message = null;
            state.status = null;
            state.statusCode = null;
        },
        clearComments: (state) => {
            state.comments = null;
        },
        clearCurrentComment: (state) => {
            state.currentComment = null;
        },
        updateCommentCount: (state, action) => {
            state.countComments = action.payload;
            console.log('✅ Updated comment count in commentSlice:', action.payload);
        },

        clearCommentsOnly: (state) => {
            state.comments = [];
            // Không reset countComments
            console.log('🧹 Cleared comments but kept count:', state.countComments);
        },
        clearAll: (state) => {
            state.comments = [];
            state.countComments = 0;
            console.log('🧹 Cleared all comments and count');
        },
        // ✅ Thêm real-time comment từ socket
        addRealTimeComment: (state, action: PayloadAction<any>) => {
            // Kiểm tra comment đã tồn tại chưa để tránh duplicate
            const existingComment = state.comments?.find(comment => comment.id === action.payload.id);
            if (!existingComment) {
                state.comments?.unshift(action.payload);
            }
            console.log('✅ Added real-time comment:', action.payload);
        },
        // ✅ Remove comment từ socket
        removeComment: (state, action: PayloadAction<string>) => {
            state.comments = state.comments?.filter(comment => comment.id !== action.payload) || [];
        },
        // ✅ Toggle like status optimistically
        toggleCommentLike: (state, action: PayloadAction<{ commentId: string; isLiked: boolean; likesCount: number }>) => {
            const { commentId, isLiked, likesCount } = action.payload;
            const comment = state.comments?.find(c => c.id === commentId);
            if (comment) {
                comment.isLiked = isLiked;
                comment.likesCount = likesCount;
            }
        },
    },
    extraReducers: (builder) => {
        // Create comment cases
        builder
            .addCase(createComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.currentComment = action.payload;
                // Comment sẽ được load lại thông qua refetch getComments
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Get comments cases
        builder
            .addCase(getComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getComments.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload.data as CommentResponseInterface[] || [];
                state.countComments = action.payload.data ? action.payload.data.length : 0; // Check if data is defined
            })
            .addCase(getComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete comment cases
        builder
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.message = 'Xóa bình luận thành công';
                // Remove deleted comment from comments array if it exists
                if (state.comments) {
                    // Assuming the response contains the deleted comment ID
                    // You might need to adjust this based on your API response
                    state.comments = state.comments.filter(comment => comment.id !== action.meta.arg);
                }
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Like comment cases
        builder
            .addCase(likeComment.pending, (state) => {
                state.error = null;
            })
            .addCase(likeComment.fulfilled, (state, action) => {
                const commentId = action.payload.commentId;
                const comment = state.comments?.find(c => c.id === commentId);
                if (comment) {
                    comment.isLiked = true;
                    comment.likesCount = (comment.likesCount || 0) + 1;
                }
            })
            .addCase(likeComment.rejected, (state, action) => {
                state.error = action.payload as string;
                // Revert optimistic update if needed
            });

        // Unlike comment cases
        builder
            .addCase(unlikeComment.pending, (state) => {
                state.error = null;
            })
            .addCase(unlikeComment.fulfilled, (state, action) => {
                const commentId = action.payload.commentId;
                const comment = state.comments?.find(c => c.id === commentId);
                if (comment) {
                    comment.isLiked = false;
                    comment.likesCount = Math.max((comment.likesCount || 0) - 1, 0);
                }
            })
            .addCase(unlikeComment.rejected, (state, action) => {
                state.error = action.payload as string;
                // Revert optimistic update if needed
            });
    },
});

export const {
    clearCommentState,
    clearComments,
    clearCurrentComment,
    addRealTimeComment,
    removeComment,
    toggleCommentLike
} = commentSlice.actions;

export default commentSlice.reducer;