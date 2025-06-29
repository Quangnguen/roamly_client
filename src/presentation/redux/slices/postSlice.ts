import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

// ✅ THÊM: Helper function chung để cập nhật like count và trạng thái isLike
const updatePostLikeCount = (state: any, postId: string, countChange: number, isLikeValue: boolean | null) => {
    // Bỏ qua optimistic posts
    if (postId.startsWith('temp-')) {
        return;
    }

    // Helper function để cập nhật một post
    const updateSinglePost = (post: Post, location: string) => {
        // Cập nhật count
        if (post._count) {
            const newCount = Math.max(0, post._count.likes + countChange);
            post._count.likes = newCount;
        } else if (post.likeCount !== undefined) {
            const newCount = Math.max(0, post.likeCount + countChange);
            post.likeCount = newCount;
        }

        // Cập nhật isLike nếu được chỉ định
        if (isLikeValue !== null) {
            post.isLike = isLikeValue;
        }
    };

    // Cập nhật trong feedPosts
    const feedPost = state.feedPosts.find((post: Post) => post.id === postId && !post.isOptimistic);
    if (feedPost) {
        updateSinglePost(feedPost, 'feedPost');
    }

    // Cập nhật trong posts
    const post = state.posts.find((post: Post) => post.id === postId && !post.isOptimistic);
    if (post) {
        updateSinglePost(post, 'post');
    }

    // Cập nhật trong myPosts
    const myPost = state.myPosts.find((post: Post) => post.id === postId && !post.isOptimistic);
    if (myPost) {
        updateSinglePost(myPost, 'myPost');
    }

    // Cập nhật trong postsByUserId
    const userPost = state.postsByUserId.find((post: Post) => post.id === postId && !post.isOptimistic);
    if (userPost) {
        updateSinglePost(userPost, 'userPost');
    }
};

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
            const response = await postUseCase.deletePost(postId);
            return { postId, response };
        } catch (error: any) {
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

export const updatePost = createAsyncThunk<PostApiResponse, { postId: string, formData: FormData }>(
    'post/updatePost',
    async (data: { postId: string, formData: FormData }, { rejectWithValue }) => {
        try {
            const response = await postUseCase.updatePost(data.postId, data.formData);
            return response as unknown as PostApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi cập nhật bài viết');
        }
    }
);

export const getPostsFeed = createAsyncThunk<PostsApiResponse, { page: number, limit: number }>(
    'post/getPostsFeed',
    async (data: { page: number, limit: number }, { rejectWithValue }) => {
        try {
            const response = await postUseCase.getPostsFeed(data.page, data.limit);
            return response as unknown as PostsApiResponse;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Có lỗi khi tải feed bài viết');
        }
    }
);

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [] as Post[],
        postsByUserId: [] as Post[],
        myPosts: [] as Post[],
        feedPosts: [] as Post[], // Thêm state cho feed posts
        loading: false, // Loading cho getPosts, getPostsByUserId, getMyPosts
        feedLoading: false, // Loading riêng cho getPostsFeed
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
                imageUrl: action.payload.imageUrls || [],
                caption: action.payload.caption || '',
                location: action.payload.location || null,
                tags: [],
                isPublic: true,
                likeCount: 0,
                commentCount: 0,
                sharedCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                author: {
                    username: action.payload.author?.username || 'Unknown',
                    profilePic: action.payload.author?.profilePic || null,
                },
                _count: {
                    likes: 0,
                    comments: 0,
                },
                score: 0,
                isLike: false,
                isToday: true,
                isFollowing: false,
                isSelf: true,
                isOptimistic: true, // Flag để phân biệt post tạm thời
                isLoading: true, // Flag để hiển thị loading state
            };

            // Thêm vào posts và feedPosts
            state.posts = [optimisticPost, ...state.posts];
            state.feedPosts = [optimisticPost, ...state.feedPosts];
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
        incrementLikeFromSocket: (state, action) => {
            const { postId } = action.payload;

            // Sử dụng helper function chung
            updatePostLikeCount(state, postId, 1, null); // null = không thay đổi isLike
        },
        decrementLikeFromSocket: (state, action) => {
            const { postId } = action.payload;

            // Sử dụng helper function chung
            updatePostLikeCount(state, postId, -1, null); // null = không thay đổi isLike
        },
        // ✅ Update comment count real-time
        updateCommentCount: (state, action: PayloadAction<{ postId: string, commentCount: number }>) => {
            const { postId, commentCount } = action.payload;

            // Update trong feedPosts
            const feedPostIndex = state.feedPosts.findIndex(post => post.id === postId);
            if (feedPostIndex !== -1) {
                if (state.feedPosts[feedPostIndex]._count) {
                    state.feedPosts[feedPostIndex]._count.comments = commentCount;
                } else {
                    state.feedPosts[feedPostIndex].commentCount = commentCount;
                }
            }

            // Update trong posts
            const postIndex = state.posts.findIndex(post => post.id === postId);
            if (postIndex !== -1) {
                if (state.posts[postIndex]._count) {
                    state.posts[postIndex]._count.comments = commentCount;
                } else {
                    state.posts[postIndex].commentCount = commentCount;
                }
            }

            // Update trong myPosts
            const myPostIndex = state.myPosts.findIndex(post => post.id === postId);
            if (myPostIndex !== -1) {
                if (state.myPosts[myPostIndex]._count) {
                    state.myPosts[myPostIndex]._count.comments = commentCount;
                } else {
                    state.myPosts[myPostIndex].commentCount = commentCount;
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
                // Tìm và cập nhật post tạm thời trong posts
                const tempPostIndex = state.posts.findIndex(post => post.id.startsWith('temp-'));
                // Tìm và cập nhật post tạm thời trong feedPosts
                const tempFeedIndex = state.feedPosts.findIndex(post => post.id.startsWith('temp-'));

                if (tempPostIndex !== -1) {
                    // Giữ lại thông tin author từ optimistic post vì API không trả về author đầy đủ
                    const optimisticPost = state.posts[tempPostIndex];
                    const updatedPost = {
                        ...action.payload.data,
                        author: optimisticPost.author, // Giữ lại author từ optimistic post
                        _count: action.payload.data._count || {
                            likes: 0,
                            comments: 0,
                        },
                        isOptimistic: false,
                        isLoading: false,
                    };

                    // Cập nhật trong posts
                    state.posts[tempPostIndex] = updatedPost;

                    // Cập nhật trong feedPosts
                    if (tempFeedIndex !== -1) {
                        state.feedPosts[tempFeedIndex] = updatedPost;
                    }

                    // Thêm post vào myPosts
                    state.myPosts = [updatedPost, ...state.myPosts];
                }
                state.message = 'Bài viết đã được đăng thành công! 🎉';
                state.status = 'success';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.createLoading = false;
                // Xóa post tạm thời nếu thất bại khỏi posts
                const tempPostIndex = state.posts.findIndex(post => post.id.startsWith('temp-'));
                if (tempPostIndex !== -1) {
                    state.posts.splice(tempPostIndex, 1);
                }

                // Xóa post tạm thời nếu thất bại khỏi feedPosts
                const tempFeedIndex = state.feedPosts.findIndex(post => post.id.startsWith('temp-'));
                if (tempFeedIndex !== -1) {
                    state.feedPosts.splice(tempFeedIndex, 1);
                }

                state.error = action.payload as string;
                state.message = `Không thể đăng bài viết: ${action.payload}`;
                state.status = 'error';
            })
            // Get Posts
            .addCase(getPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.loading = false;
                // Giữ lại optimistic posts khi replace
                const optimisticPosts = state.posts.filter(post => post.isOptimistic);
                state.posts = [...optimisticPosts, ...action.payload.data];
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
                state.postsByUserId = action.payload.data;
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
                const posts = action.payload.data || [];
                state.myPosts = posts;
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

                // Sử dụng helper function chung: +1 like và set isLike = true
                updatePostLikeCount(state, postId, 1, true);
            })
            // Unlike Post - cập nhật likeCount khi unlike thành công
            .addCase(unlikePost.fulfilled, (state, action) => {
                const postId = action.meta.arg; // postId được truyền vào action

                // Sử dụng helper function chung: -1 like và set isLike = false
                updatePostLikeCount(state, postId, -1, false);
            })
            // Update Post
            .addCase(updatePost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPost = action.payload.data;

                // Cập nhật trong danh sách posts
                const postIndex = state.posts.findIndex(post => post.id === updatedPost.id);
                if (postIndex !== -1) {
                    state.posts[postIndex] = {
                        ...state.posts[postIndex],
                        ...updatedPost,
                    };
                }

                // Cập nhật trong danh sách myPosts
                const myPostIndex = state.myPosts.findIndex(post => post.id === updatedPost.id);
                if (myPostIndex !== -1) {
                    state.myPosts[myPostIndex] = {
                        ...state.myPosts[myPostIndex],
                        ...updatedPost,
                    };
                }

                state.currentPost = updatedPost;
                state.message = 'Đã cập nhật bài viết thành công';
                state.status = 'success';
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
            // Get Posts Feed
            .addCase(getPostsFeed.pending, (state) => {
                state.feedLoading = true;
                state.error = null;
            })
            .addCase(getPostsFeed.fulfilled, (state, action) => {
                state.feedLoading = false;
                const newPosts = action.payload.data;
                const page = action.meta.arg.page;

                if (page === 1) {
                    // Giữ lại optimistic posts khi replace
                    const optimisticPosts = state.feedPosts.filter(post => post.isOptimistic);
                    state.feedPosts = [...optimisticPosts, ...newPosts];
                } else {
                    // Append new posts, loại bỏ duplicate nếu có
                    const existingIds = new Set(state.feedPosts.map(post => post.id));
                    const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
                    state.feedPosts = [...state.feedPosts, ...uniqueNewPosts];
                }
                state.error = null;
            })
            .addCase(getPostsFeed.rejected, (state, action) => {
                state.feedLoading = false;
                state.error = action.payload as string;
                state.message = action.payload as string;
                state.status = 'error';
            })
    },
});

export const {
    clearMessage,
    addOptimisticPost,
    updateOptimisticPost,
    incrementLikeFromSocket,
    decrementLikeFromSocket,
    updateCommentCount
} = postSlice.actions;

export default postSlice.reducer;