import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { PostUseCase } from '@/src/domain/usecases/postUsecase';
import { Post } from '@/src/domain/models/Post';
import { PostRepositoryImpl } from '@/src/data/implements/postRepositoryImpl';
import { ResponseInterface } from '@/src/types/ResponseInterface';
import { likePost, unlikePost, initializeLikeStatus } from './likeSlice';

// Định nghĩa interface cho response API
interface PostApiResponse extends ResponseInterface<Post> { }
interface PostsApiResponse extends ResponseInterface<Post[]> { }

// Khởi tạo PostUseCase với PostRepositoryImpl
const postUseCase = new PostUseCase(new PostRepositoryImpl());

export const createPost = createAsyncThunk<PostApiResponse, { images: FormData, caption: string, location?: string | null }>(
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
            console.log('Response POST :', response);
            return response as unknown as PostApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    }
);

export const getPosts = createAsyncThunk<PostsApiResponse, void>(
    'post/getPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPosts();
            return response as unknown as PostsApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết');
        }
    }
);

export const getPostsByUserId = createAsyncThunk<PostsApiResponse, string>(
    'post/getPostsByUserId',
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPostsByUserId(userId);
            return response as unknown as PostsApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết của user');
        }
    }
);

export const getMyPosts = createAsyncThunk<PostsApiResponse, void>(
    'post/getMyPosts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getMyPosts();
            return response as unknown as PostsApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết của bạn');
        }
    }
);

export const deletePost = createAsyncThunk<any, string>(
    'post/deletePost',
    async (postId: string, { rejectWithValue }) => {
        try {
            console.log('Deleting post with ID:', postId);
            const response = await postUseCase.deletePost(postId);
            console.log('Delete post response:', response);
            return { postId, response };
        } catch (error: any) {
            console.error('Delete post error:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            return rejectWithValue(error.response?.data?.message || error.message || 'Có lỗi khi xóa bài viết');
        }
    }
);

export const getPostById = createAsyncThunk<PostApiResponse, string>(
    'post/getPostById',
    async (postId: string, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPostById(postId);
            return response as unknown as PostApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải bài viết');
        }
    }
);


const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [] as Post[],
        myPosts: [] as Post[],
        loading: false, // Loading cho getPosts, getPostsByUserId, getMyPosts
        createLoading: false, // Loading riêng cho createPost
        error: null as string | null,
        message: null as string | null,
        status: null as 'success' | 'error' | null,
        currentPost: null as Post | null,
    },
    reducers: {
        clearMessage: (state) => {
            state.message = null;
            state.status = null;
        },
        addOptimisticPost: (state, action) => {
            // Thêm post tạm thời với trạng thái loading
            const optimisticPost: Post = {
                id: `temp-${Date.now()}`,
                authorId: action.payload.authorId,
                imageUrl: action.payload.imageUrls,
                caption: action.payload.caption,
                location: action.payload.location,
                tags: [],
                isPublic: true,
                likeCount: 0,
                commentCount: 0,
                sharedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: action.payload.author,
                isOptimistic: true, // Flag để phân biệt post tạm thời
                isLoading: true, // Flag để hiển thị loading state
            };
            state.posts = [optimisticPost, ...state.posts];
        },
        updateOptimisticPost: (state, action) => {
            // Cập nhật hoặc thay thế post tạm thời bằng post thực từ server
            const tempIndex = state.posts.findIndex(post => post.id.startsWith('temp-'));
            if (tempIndex !== -1) {
                if (action.payload.success) {
                    // Thay thế bằng post thực từ server
                    state.posts[tempIndex] = action.payload.data;
                } else {
                    // Xóa post tạm thời nếu thất bại
                    state.posts.splice(tempIndex, 1);
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPost.pending, (state) => {
                state.createLoading = true;
                state.error = null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.createLoading = false;
                // Tìm và cập nhật post tạm thời
                const tempIndex = state.posts.findIndex(post => post.id.startsWith('temp-'));
                if (tempIndex !== -1) {
                    // Giữ lại thông tin author từ optimistic post vì API không trả về author đầy đủ
                    const optimisticPost = state.posts[tempIndex];
                    const updatedPost = {
                        ...action.payload.data,
                        author: optimisticPost.author, // Giữ lại author từ optimistic post
                        isOptimistic: false,
                        isLoading: false,
                    };
                    state.posts[tempIndex] = updatedPost;
                    // Thêm post vào myPosts nữa
                    state.myPosts = [updatedPost, ...state.myPosts];
                }
                state.message = 'Đăng bài viết thành công';
                state.status = 'success';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createLoading = false;
                // Xóa post tạm thời nếu thất bại
                const tempIndex = state.posts.findIndex(post => post.id.startsWith('temp-'));
                if (tempIndex !== -1) {
                    state.posts.splice(tempIndex, 1);
                }
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
                state.posts = action.payload.data;
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
                state.posts = action.payload.data;
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
                state.myPosts = action.payload.data;
                state.error = null;
            })
            .addCase(getMyPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Delete Post
            .addCase(deletePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.loading = false;
                // Xóa post khỏi danh sách
                state.posts = state.posts.filter(post => post.id !== action.payload.postId);
                state.myPosts = state.myPosts.filter(post => post.id !== action.payload.postId);
                state.message = 'Đã xóa bài viết thành công';
                state.status = 'success';
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Get Post By Id
            .addCase(getPostById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPostById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPost = action.payload.data;
                state.error = null;
            })
            .addCase(getPostById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Like Post - cập nhật likeCount khi like thành công
            .addCase(likePost.fulfilled, (state, action) => {
                const postId = action.meta.arg; // postId được truyền vào action
                // Cập nhật likeCount trong posts
                const postIndex = state.posts.findIndex(post => post.id === postId);
                if (postIndex !== -1) {
                    state.posts[postIndex].likeCount += 1;
                }
                // Cập nhật likeCount trong myPosts nếu có
                const myPostIndex = state.myPosts.findIndex(post => post.id === postId);
                if (myPostIndex !== -1) {
                    state.myPosts[myPostIndex].likeCount += 1;
                }
            })
            // Unlike Post - cập nhật likeCount khi unlike thành công
            .addCase(unlikePost.fulfilled, (state, action) => {
                const postId = action.meta.arg; // postId được truyền vào action
                // Cập nhật likeCount trong posts
                const postIndex = state.posts.findIndex(post => post.id === postId);
                if (postIndex !== -1 && state.posts[postIndex].likeCount > 0) {
                    state.posts[postIndex].likeCount -= 1;
                }
                // Cập nhật likeCount trong myPosts nếu có
                const myPostIndex = state.myPosts.findIndex(post => post.id === postId);
                if (myPostIndex !== -1 && state.myPosts[myPostIndex].likeCount > 0) {
                    state.myPosts[myPostIndex].likeCount -= 1;
                }
            });
    },
});

export const { clearMessage, addOptimisticPost, updateOptimisticPost } = postSlice.actions;
export default postSlice.reducer;