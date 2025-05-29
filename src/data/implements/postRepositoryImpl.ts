import { Post } from "@/src/domain/models/Post"
import { PostRepository } from "../repositories/postRepository"
import { createPostApi, getPostsApi, getPostsByUserIdApi, getMyPostsApi } from "../api/postApi"

export class PostRepositoryImpl implements PostRepository {
    async createPost(formData: FormData): Promise<Post> {
        const response = await createPostApi(formData)
        return response
    }

    async getPosts(): Promise<Post[]> {
        const response = await getPostsApi()
        return response
    }

    async getPostsByUserId(userId: string): Promise<Post[]> {
        const response = await getPostsByUserIdApi(userId);
        return response;
    }

    async getMyPosts(): Promise<Post[]> {
        const response = await getMyPostsApi();
        return response;
    }
}