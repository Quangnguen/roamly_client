import { API_BASE_URL } from "@/src/const/api";
import { authorizedRequest } from "@/src/utils/authorizedRequest";
import { PostSearchResponseInterface, SearchPostParams } from "@/src/types/responses/PostSearchResponseInterface";

// Tạo bài post mới
export const createPostApi = async (formData: FormData) => {
    
    // Xử lý taggedDestinations
    const processedFormData = new FormData();
    const taggedDestinations: string[] = [];
    
    for (const [key, value] of formData.entries()) {
        if (key === 'taggedDestinations') {
            taggedDestinations.push(value as string);
        } else {
            processedFormData.append(key, value);
        }
    }
    
    // Gửi taggedDestinations dưới dạng array notation
    if (taggedDestinations.length > 0) {
        taggedDestinations.forEach(destination => {
            processedFormData.append('taggedDestinations[]', destination);
        });
    }
    
    
    return await authorizedRequest(`${API_BASE_URL}/posts`, {
        method: 'POST',
        body: processedFormData
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

// Search posts
export const searchPostsApi = async (params: SearchPostParams): Promise<PostSearchResponseInterface> => {
    const { q, limit = 10, page = 1 } = params;
    const queryParams = new URLSearchParams({
        q,
        limit: limit.toString(),
        page: page.toString()
    });

    return await authorizedRequest(`${API_BASE_URL}/posts/search?${queryParams}`, {
        method: 'GET',
    });
};

export const getPostByDestinationIdApi = async (destinationId: string) => {
    return await authorizedRequest(`${API_BASE_URL}/posts/by-destination?destinationId=${destinationId}`, {
        method: 'GET',
    });
}
