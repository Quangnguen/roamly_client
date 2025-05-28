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
