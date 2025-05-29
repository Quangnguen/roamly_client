import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PostUseCase } from '@/src/domain/usecases/postUsecase';
import { Post } from '@/src/domain/models/Post';
import { PostRepositoryImpl } from '@/src/data/implements/postRepositoryImpl';

// Khởi tạo PostUseCase với PostRepositoryImpl
const postUseCase = new PostUseCase(new PostRepositoryImpl());

export const createPost = createAsyncThunk(
    'post/createPost',
    async (data: { images: FormData, caption: string, location?: string | null }, { rejectWithValue }) => {
        try {
            const formData = new FormData();

            // Lấy images từ FormData đã được tạo sẵn
            const existingImages = Array.from(data.images.getAll('images'));
            existingImages.forEach((image) => {
                formData.append('images', image);
            });

            formData.append('caption', data.caption);
            if (data.location) {
                formData.append('location', data.location);
            }
            formData.append('isPublic', 'true');

            const response = await postUseCase.createPost(formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    }
);

export const getPosts = createAsyncThunk(
    'post/getPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPosts();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết');
        }
    }
);

export const getPostsByUserId = createAsyncThunk(
    'post/getPostsByUserId',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPostsByUserId(userId);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết của user');
        }
    }
);

export const getMyPosts = createAsyncThunk(
    'post/getMyPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getMyPosts();
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết của bạn');
        }
    }
);

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [] as Post[],
        myPosts: [] as Post[],
        loading: false,
        error: null as string | null,
        message: null as string | null,
        status: null as 'success' | 'error' | null,
    },
    reducers: {
        clearMessage: (state) => {
            state.message = null;
            state.status = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = [action.payload, ...state.posts];
                state.message = 'Đăng bài viết thành công';
                state.status = 'success';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Get Posts
            .addCase(getPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Get Posts By UserId
            .addCase(getPostsByUserId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPostsByUserId.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload;
                state.error = null;
            })
            .addCase(getPostsByUserId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Get My Posts
            .addCase(getMyPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.myPosts = action.payload;
                state.error = null;
            })
            .addCase(getMyPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            });
    },
});

export const { clearMessage } = postSlice.actions;
export default postSlice.reducer;