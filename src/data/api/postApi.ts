import { API_BASE_URL } from "@/src/const/api";
import { Post } from "@/src/domain/models/Post"
import { authorizedRequest } from "@/src/utils/authorizedRequest";

// Tạo bài post mới
export const createPostApi = async (formData: FormData) => {
    return await authorizedRequest(`${API_BASE_URL}/posts`, {
        method: 'POST',
        body: formData
    });
};

export const getPostsApi = async () => {
    return await authorizedRequest(`${API_BASE_URL}/posts`, {
        method: 'GET',
    });
};

export const getPostsByUserIdApi = async (userId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/get-posts/${userId}`, {
        method: 'GET',
    });
};

export const getMyPostsApi = async () => {
    const result = await authorizedRequest(`${API_BASE_URL}/posts/my-posts`, {
        method: 'GET',
    });
    return result;
};

export const deletePostApi = async (postId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
    });
};

export const getPostByIdApi = async (postId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/${postId}`, {
        method: 'GET',
    });
};

export const updatePostApi = async (postId: string, formData: FormData) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PATCH',
        body: formData
    });
};

export const getPostsFeedApi = async (page: number, limit: number) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/feed?page=${page}&limit=${limit}`, {
        method: 'GET',
    });
};
